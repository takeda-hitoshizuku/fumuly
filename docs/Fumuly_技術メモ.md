# Fumuly 技術メモ

*最終更新：2026-03-01*

---

## 技術スタック

| レイヤー | 技術 | 補足 |
|--------|------|------|
| フレームワーク | Next.js 16 (App Router) | React 19 / TypeScript |
| スタイリング | Tailwind CSS 4 + shadcn/ui | Radix UI ベース |
| データベース | Supabase（PostgreSQL） | テキストデータのみ保存 |
| ローカルストレージ | IndexedDB | 画像データはここに保持 |
| AI解析 | Claude API（Vision） | `claude-sonnet-4-5-20250929` |
| ホスティング | Vercel | カスタムドメイン `fumuly.com` |
| 認証 | Supabase Auth | メール認証 / Cookie-based（@supabase/ssr） |
| オフライン | Service Worker + UpdateBanner | PWA更新検知 |
| 決済 | Stripe | 月額480円・年額4,400円 |

---

## インフラ構成

```
ユーザー（スマホ / PC）
  │
  ├─ Next.js App（Vercel）
  │     ├─ App Router（フロント + API Routes）
  │     ├─ Middleware（セッション管理 / @supabase/ssr）
  │     └─ IndexedDB（画像をローカル保存）
  │
  ├─ API Routes（Vercel Serverless Functions）
  │     ├─ /api/analyze（書類解析 → Claude Vision API）
  │     ├─ /api/chat（AIチャット → Claude API）
  │     ├─ /api/regenerate（サマリー再生成 → Claude API）
  │     ├─ /api/stripe/checkout（決済セッション作成）
  │     ├─ /api/stripe/webhook（Stripe Webhook受信）
  │     └─ /api/stripe/portal（Customer Portal）
  │
  ├─ Supabase
  │     ├─ PostgreSQL（profiles / documents / conversations）
  │     ├─ Auth（メール認証）
  │     └─ RLS（Row Level Security）
  │
  └─ Stripe（決済基盤）
        ├─ Checkout Session（決済）
        ├─ Customer Portal（プラン管理・解約）
        └─ Webhook（状態同期）
```

---

## ページ構成

### メインページ（認証必須）

| パス | ファイル | 用途 |
|------|---------|------|
| `/home` | `app/(main)/home/page.tsx` | ホーム画面 |
| `/scan` | `app/(main)/scan/page.tsx` | 書類撮影・AI解析 |
| `/documents` | `app/(main)/documents/page.tsx` | 書類一覧 |
| `/documents/[id]` | `app/(main)/documents/[id]/page.tsx` | 書類詳細 |
| `/chat` | `app/(main)/chat/page.tsx` | AIチャット相談 |
| `/settings` | `app/(main)/settings/page.tsx` | 設定画面 |
| `/settings/profile` | `app/(main)/settings/profile/page.tsx` | プロフィール編集 |

### 認証ページ

| パス | ファイル | 用途 |
|------|---------|------|
| `/login` | `app/(auth)/login/page.tsx` | ログイン |
| `/register` | `app/(auth)/register/page.tsx` | 新規登録 |
| `/onboarding` | `app/(auth)/onboarding/page.tsx` | 初期設定 |

### 公開ページ

| パス | ファイル | 用途 |
|------|---------|------|
| `/` | `app/page.tsx` | ランディング |
| `/pricing` | `app/pricing/page.tsx` | 料金プラン（公開紹介ページ） |
| `/upgrade` | `app/(main)/upgrade/page.tsx` | プランアップグレード（認証必須） |
| `/privacy` | `app/privacy/page.tsx` | プライバシーポリシー |
| `/terms` | `app/terms/page.tsx` | 利用規約 |
| `/disclaimer` | `app/disclaimer/page.tsx` | 免責事項 |
| `/legal` | `app/legal/page.tsx` | 特定商取引法に基づく表記 |

---

## データ設計

### テーブル構成

| テーブル | 用途 |
|---------|------|
| `profiles` | ユーザー拡張情報（プラン、VIP、Stripe情報、プロフィール） |
| `documents` | スキャンした書類のAI解析結果 |
| `conversations` | チャット履歴 |

### profiles テーブル

```sql
CREATE TABLE profiles (
  id                     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  display_name           TEXT,
  income_type            TEXT,
  monthly_income         INTEGER,
  debt_total             INTEGER,
  debt_creditors         TEXT[],
  has_adhd               BOOLEAN DEFAULT FALSE,
  phone_difficulty       BOOLEAN DEFAULT FALSE,
  characteristics_other  TEXT,
  current_situation      TEXT,
  onboarding_done        BOOLEAN DEFAULT FALSE,
  plan                   TEXT DEFAULT 'free' CHECK (plan IN ('free', 'paid')),
  is_vip                 BOOLEAN DEFAULT FALSE,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT
);
```

**保護されたカラム（ユーザーが直接変更不可、RLSで制御）:**
- `plan` — Stripe Webhook のみが更新
- `is_vip` — 管理者が Supabase Dashboard で変更
- `stripe_customer_id` — Checkout API が設定
- `stripe_subscription_id` — Webhook が設定

### documents テーブル

```sql
CREATE TABLE documents (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sender             TEXT,
  type               TEXT,
  amount             INTEGER,
  deadline           DATE,
  action_required    BOOLEAN,
  priority           TEXT CHECK (priority IN ('high', 'medium', 'low', 'ignore')),
  category           TEXT CHECK (category IN ('urgent', 'action', 'keep', 'ignore')),
  summary            TEXT,
  recommended_action TEXT,
  detailed_summary   TEXT,
  is_done            BOOLEAN DEFAULT FALSE,
  local_image_id     TEXT  -- IndexedDB上の画像参照キー
);
```

### conversations テーブル

```sql
CREATE TABLE conversations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id    UUID REFERENCES documents(id) ON DELETE SET NULL,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role           TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content        TEXT NOT NULL,
  has_image      BOOLEAN DEFAULT FALSE,
  local_image_id TEXT
);
```

### 画像の取り扱いフロー

```
撮影（最大5枚）
  ↓
IndexedDB（端末内）に一時保存
  ↓
base64エンコード → Claude Vision APIへ送信（解析のみ）
  ↓
解析結果テキストをSupabaseへ保存
  ↓
画像はIndexedDB内に保持（ユーザーが削除可能）
※ サーバーに画像は保存しない
```

---

## API設計

### Claude API

**使用モデル:** `claude-sonnet-4-5-20250929`

**3つのAPI用途:**

| API | 用途 | max_tokens |
|-----|------|-----------|
| `/api/analyze` | 書類画像の解析（Vision） | 2000 |
| `/api/chat` | AIチャット相談 | 1000 |
| `/api/regenerate` | 金額修正後のサマリー再生成 | 1000 |

**書類解析のシステムプロンプト方針:**
- 督促・差押などのキーワードを確実に `high` 判定
- 金額は「今回ユーザーが実際に振り込む合計金額」を優先（内訳や残高は含めない）
- 払込取扱票のマス目欄の数字を振込総額として認識
- 手書き・印字混在に対応
- 書類以外の画像には `error: "not_a_document"` を返す
- 複数画像は同一書類の別ページとして総合解析
- 必ずJSON形式のみで返答

**解析レスポンスJSON:**

```json
{
  "sender": "送付元名",
  "type": "書類種別",
  "amount": 12000,
  "amount_candidates": [12000, 8000, 3000],
  "deadline": "2026-03-31",
  "action_required": true,
  "priority": "high",
  "category": "urgent",
  "summary": "電気料金の督促状",
  "recommended_action": "コンビニまたはWebから3/31までに支払い",
  "detailed_summary": "（寄り添うトーンの詳細説明）"
}
```

**チャットのシステムプロンプト方針:**
- ユーザープロフィール（収入・借金・特性）をコンテキストとして渡す
- 直近10件の書類データをコンテキストとして渡す
- 会話履歴（直近20件）を渡して文脈を保持
- 対応範囲外のトピック（雑談・創作等）は拒否
- 未実装機能について聞かれたら正直に「まだできない」と伝える

### Stripe API

| エンドポイント | 用途 |
|--------------|------|
| `/api/stripe/checkout` | Checkout Session 作成 → Stripe決済ページへリダイレクト |
| `/api/stripe/webhook` | Stripe イベント受信 → profiles.plan 更新 |
| `/api/stripe/portal` | Customer Portal セッション作成 → プラン管理・解約 |

**Webhook で処理するイベント:**
- `checkout.session.completed` → plan を 'paid' に更新、subscription_id 保存
- `customer.subscription.updated` → サブスク状態変更に追従
- `customer.subscription.deleted` → plan を 'free' に戻す
- `invoice.payment_failed` → ログ記録

---

## 認証・セッション管理

- **Cookie-based 認証**（`@supabase/ssr`）
- Middleware（`middleware.ts`）で全リクエストのセッションをリフレッシュ
- `/api/stripe/webhook` は Middleware の matcher から除外（Stripe からの POST のため）
- ログイン/登録後は `window.location.href` でフルリロード（Cookie 伝播のため）

---

## レート制限

| API | 無料ユーザー | 有料/VIP | 管理者（ADMIN_USER_ID） |
|-----|------------|---------|----------------------|
| スキャン（`/api/analyze`） | 月1件 | 無制限 | 無制限 |
| チャット（`/api/chat`） | 利用不可 | 20回/時 | 無制限 |
| 再生成（`/api/regenerate`） | 50件/日 | 50件/日 | 無制限 |

**判定ロジック:**
- 管理者: `user.id === process.env.ADMIN_USER_ID` → 全制限免除
- 有料/VIP: `isPremiumUser(profile)` → `plan === 'paid' || is_vip === true` → スキャン無制限・チャット利用可
- スキャン件数: `documents` テーブルで当月のレコード数をカウント
- チャット: 無料ユーザーは `isPremiumUser()` で403ブロック、有料ユーザーは `conversations` テーブルで直近1時間の user メッセージ数をカウント

---

## 決済（Stripe）

**料金プラン:**
- 無料: 0円（月1通スキャン、チャット利用不可）
- 月額: 480円（税込）
- 年額: 4,400円（税込、約23%OFF）

**決済フロー:**
1. ユーザーが `/upgrade` でプランを選択（認証必須、`/pricing` は公開紹介ページ）
2. `/api/stripe/checkout` で Checkout Session 作成（サーバーサイドで Price ID を解決）
3. Stripe 決済ページで支払い
4. Webhook が `checkout.session.completed` を受信 → `profiles.plan = 'paid'` に更新
5. 設定画面の「プラン管理」→ Customer Portal で変更・解約可能

**VIPフラグ:**
- `profiles.is_vip = true` で有料プランと同等の機能を無料提供
- Supabase Dashboard の Table Editor から管理者が直接変更
- RLS ポリシーでユーザー自身は変更不可

---

## セキュリティ

- **Supabase RLS**: 全テーブルで有効化。ユーザーは自分のデータのみ読み書き可能
- **保護カラム**: plan / is_vip / stripe_* は RLS の WITH CHECK で変更を禁止
- **APIキー**: 全て環境変数で管理。フロントに露出するのは `NEXT_PUBLIC_*` のみ
- **Stripe Webhook 署名検証**: `STRIPE_WEBHOOK_SECRET` で署名を検証
- **Checkout セキュリティ**: Price ID はサーバーサイドで解決（フロントからは plan 名のみ送信）
- **入力サニタイズ**: ユーザープロフィールは XML タグで囲んでプロンプトインジェクション対策
- **画像サイズ制限**: 1枚14MB / 合計20MB / 最大5枚

---

## PWA対応

- Service Worker（`public/sw.js`）でキャッシュ管理
- `prebuild` スクリプトでビルドタイムスタンプを SW に埋め込み、更新検知に使用
- UpdateBanner コンポーネントで新バージョン通知
- モバイルキーボード対応: `visualViewport` API でキーボード検知、ボトムナビ非表示

---

## 擬似ステートフル設計（文脈保持）

Claude API はステートレスだが、Supabase から取得したデータをコンテキストとして渡すことで擬似的な文脈保持を実現。

**渡すコンテキスト:**
- ユーザープロフィール（収入・借金・特性等）→ `<user_profile>` タグで囲む
- 直近10件の書類データ → `<user_documents>` タグで囲む
- 会話履歴（直近20件）→ messages 配列として渡す

**トークン管理:**
- 履歴は直近10件・要約フィールドのみに絞る（summary は200文字にトランケート）
- フリーテキスト入力は500文字にトランケート
- XML タグ内のデータに対するプロンプトインジェクション対策の注意書きを付与

---

## 未実装機能（将来検討）

- リマインダー・通知機能（期限通知 / Web Push）
- カレンダー連携（Google Calendar API）
- 書類の画像再表示（現在は撮影後に画像を保持していない）
- タスク・ToDo 管理
- 書類の共有・家族共有
- Notion 連携

---

## 環境変数一覧

| 変数名 | 用途 | 公開範囲 |
|--------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase接続 | フロント |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名キー | フロント |
| `NEXT_PUBLIC_APP_URL` | アプリURL | フロント |
| `SUPABASE_URL` | Supabase接続 | バックエンド |
| `SUPABASE_SERVICE_ROLE_KEY` | DB管理者キー | バックエンド |
| `ANTHROPIC_API_KEY` | Claude API | バックエンド |
| `STRIPE_SECRET_KEY` | Stripe API | バックエンド |
| `STRIPE_WEBHOOK_SECRET` | Webhook署名検証 | バックエンド |
| `STRIPE_MONTHLY_PRICE_ID` | 月額プランID | バックエンド |
| `STRIPE_YEARLY_PRICE_ID` | 年額プランID | バックエンド |
| `ADMIN_USER_ID` | 管理者UUID | バックエンド |

---

## デプロイ

- `main` ブランチへの push で Vercel が自動デプロイ
- カスタムドメイン `fumuly.com` は Vercel に紐付け済み（お名前ドットコムから NS 委譲）
- SSL 証明書は Vercel が自動管理
- 手動デプロイ: `npx vercel --prod`
