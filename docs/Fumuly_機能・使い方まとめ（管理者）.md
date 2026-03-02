# Fumuly 管理者ガイド

## 1. 管理者アカウント（ADMIN_USER_ID）

環境変数 `ADMIN_USER_ID` にSupabaseのユーザーID（UUID）を設定すると、以下のAPI制限が全て免除される。

| API | 通常の制限 | 管理者 |
|-----|-----------|--------|
| スキャン（`/api/analyze`） | 無料: 月5件 / 有料: 無制限 | 無制限 |
| チャット（`/api/chat`） | 20回/時 | 無制限 |
| 再生成（`/api/regenerate`） | 50件/日 | 無制限 |

### 設定方法

1. Supabase Dashboard > Authentication > Users で自分のUUIDを確認
2. Vercel Dashboard > Settings > Environment Variables で `ADMIN_USER_ID` に設定
3. `.env.local` にも同じ値を設定（ローカル開発用）

---

## 2. VIPフラグ（is_vip）

友人等に有料プランと同等の機能を無料提供するためのフラグ。

### 効果

- スキャン無制限（月5件制限なし）
- 設定画面に「VIP（無料提供）」と表示
- Stripeのサブスク契約は不要

### 付与方法

Supabase Dashboard > Table Editor > profiles > 対象ユーザーの `is_vip` を `true` に変更

### 注意

- ユーザー自身は `is_vip` を変更できない（RLSポリシーで保護済み）
- VIPユーザーにはStripeのプラン管理ボタンが表示されない

---

## 3. Stripe商品管理

### 商品の作成

Stripe Dashboard > 商品カタログ > 商品を追加

**月額プラン:**
- 商品名: `Fumuly有料プラン`（または任意の名前）
- 価格: 480円（JPY）
- 請求間隔: 月次（Monthly）
- 作成後、Price ID（`price_xxx`）をコピー

**年額プラン:**
- 同じ商品に価格を追加、または別商品として作成
- 価格: 4,400円（JPY）
- 請求間隔: 年次（Yearly）
- 作成後、Price ID（`price_xxx`）をコピー

### 環境変数への反映

Vercel Dashboard > Settings > Environment Variables:
- `STRIPE_MONTHLY_PRICE_ID` = 月額の `price_xxx`
- `STRIPE_YEARLY_PRICE_ID` = 年額の `price_xxx`

### 価格の変更

1. Stripe Dashboard で新しいPriceを作成（既存Priceは変更不可）
2. 環境変数のPrice IDを新しい値に更新
3. Vercelを再デプロイ
4. `lib/plans.ts` の表示金額も合わせて修正（`/pricing` と `/upgrade` で共通利用）

### Webhookの設定

Stripe Dashboard > 開発者 > Webhook

- エンドポイントURL: `https://fumuly.com/api/stripe/webhook`
- リッスンするイベント:
  - `checkout.session.completed`（決済完了 → plan='paid'に更新）
  - `customer.subscription.updated`（サブスク状態変更に追従）
  - `customer.subscription.deleted`（解約 → plan='free'に戻す）
  - `invoice.payment_failed`（決済失敗ログ）
- 作成後、Signing secretを `STRIPE_WEBHOOK_SECRET` に設定

### Customer Portal

有料ユーザーが設定画面の「プラン管理」ボタンから以下を行える:
- プラン変更（月額 ↔ 年額）
- 支払い方法の更新
- サブスクリプションの解約

Portal の設定は Stripe Dashboard > 設定 > カスタマーポータル で変更可能。

### テストモード

- Stripe Dashboard 右上の「テストモード」をオンにすると、テスト環境で動作確認できる
- テストカード: `4242 4242 4242 4242` / 有効期限: 未来の任意の日付 / CVC: 任意の3桁

---

## 4. 認証設定

### 認証方式

Google OAuth + メール/パスワードのハイブリッド認証を採用。

| 方式 | 用途 |
|------|------|
| Google OAuth | メインの認証方式。ワンクリックでログイン |
| メール/パスワード | テストアカウント作成やGoogle未使用ユーザー向け |

### Google OAuth（Google Cloud Console）

- プロジェクト: `fumuly`
- OAuth Client ID: `77566805633-v3qakjcabof1akkq6ugmusqr6b1dq76b.apps.googleusercontent.com`
- 承認済みリダイレクトURI: `https://ecrzbrgtrgyoybvaxfbr.supabase.co/auth/v1/callback`
- OAuth同意画面のサポートメール: `fumuly@googlegroups.com`（個人メール非公開のためGoogle Group経由）

### Supabase側の設定

Supabase Dashboard > Authentication > Providers > Google で以下を設定済み:
- Client ID と Client Secret を登録
- 新規ユーザーのプロフィールは `on_auth_user_created` トリガーで自動作成される

### パスワードリセット

- ログイン画面の「パスワードをお忘れですか？」からリセットメールを送信
- メール送信はSupabase Authが処理（外部メールサービス不要）
- リセットフロー: `/reset-password`（メール入力）→ メール内リンク → `/update-password`（新パスワード設定）

---

## 5. Cloudflare / メール

### DNS管理

- ドメイン: `fumuly.com`（Cloudflareでフル管理）
- ネームサーバー: `paris.ns.cloudflare.com` / `vern.ns.cloudflare.com`（お名前ドットコムからNS委譲）
- Vercel向けDNS: A `76.76.21.21` / CNAME `cname.vercel-dns.com`（DNS only）

### Email Routing

- `support@fumuly.com` → 個人メールアドレスに転送（Cloudflare Email Routing）
- 受信専用（送信はできない）
- プライバシーポリシー・特商法に記載のメールアドレス

### 注意

- `noreply@fumuly.com` からの送信が必要な場合は、Resend等の外部サービスが必要（未実装）
- メールへの返信は個人メールアドレスが見えるため注意

---

## 6. Supabase管理

### SQL実行

Management APIで実行可能（CLAUDE.md参照）。またはSupabase Dashboard > SQL Editorから直接実行。

### テーブル構成

| テーブル | 用途 |
|---------|------|
| `profiles` | ユーザー拡張情報（プラン、VIP、Stripe情報含む） |
| `documents` | スキャンした書類のAI解析結果 |
| `conversations` | チャット履歴 |

### 保護されたカラム（ユーザーが直接変更不可）

- `profiles.plan` — free/paidの切替はWebhookのみ
- `profiles.is_vip` — 管理者がDashboardで変更
- `profiles.stripe_customer_id` — Checkout API が設定
- `profiles.stripe_subscription_id` — Webhookが設定

### ユーザーデータの確認

Supabase Dashboard > Table Editor で各テーブルを直接確認・編集可能。

---

## 7. Vercel管理

### 環境変数一覧

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
| `ENCRYPTION_KEY` | チャット・書類データ暗号化キー | バックエンド |

### デプロイ

`main` ブランチへのpushで自動デプロイ。手動デプロイは `npx vercel --prod`。

### カスタムドメイン

- `fumuly.com` → Vercelに紐付け済み（お名前ドットコムからNS委譲）
- SSL証明書はVercelが自動管理

---

## 8. レート制限まとめ

| API | 無料ユーザー | 有料/VIP | 管理者 |
|-----|------------|---------|--------|
| スキャン | 月5件 | 無制限 | 無制限 |
| チャット | 20回/時 | 20回/時 | 無制限 |
| 再生成 | 50件/日 | 50件/日 | 無制限 |

---

## 9. トラブルシューティング

### ユーザーがスキャンできない

1. profiles テーブルで `plan` / `is_vip` を確認
2. 今月のdocuments数を確認（月5件超過していないか）
3. `ADMIN_USER_ID` が正しいか確認（管理者の場合）

### Stripe決済が動かない

1. Vercelの環境変数（`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, Price ID）を確認
2. Stripe Dashboard > Webhooks でエンドポイントのステータスを確認
3. Webhook Signing Secretが一致しているか確認

### チャットが制限される

- 1時間待つか、`ADMIN_USER_ID` が正しく設定されているか確認

### デプロイが失敗する

- Vercel Dashboard > Deployments でビルドログを確認
- 環境変数の漏れがないか確認（特にSupabase系）
