# Fumuly 管理者ガイド

## 1. 管理者アカウント（ADMIN_USER_ID）

環境変数 `ADMIN_USER_ID` にSupabaseのユーザーID（UUID）を設定すると、以下のAPI制限が全て免除される。

| API | 通常の制限 | 管理者 |
|-----|-----------|--------|
| スキャン（`/api/analyze`） | 無料: 月1件 / 有料: 無制限 | 無制限 |
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

- スキャン無制限（月1件制限なし）
- 設定画面に「VIP（無料提供）」と表示
- Stripeのサブスク契約は不要

### 付与方法

Supabase Dashboard > Table Editor > profiles > 対象ユーザーの `is_vip` を `true` に変更

### 注意

- ユーザー自身は `is_vip` を変更できない（RLSポリシーで保護済み）
- VIPユーザーにはStripeのプラン管理ボタンが表示されない

---

## 3. Stripe商品管理

### 本番環境（2026-03-05 移行済み）

| 項目 | 値 |
|------|-----|
| 商品 | `prod_U5fyCorXI742qP`（Fumuly プレミアムプラン） |
| 月額Price | `price_1T7Ucs72vnPgRIYViilKK1L7`（480円/月） |
| 年額Price | `price_1T7Ucu72vnPgRIYVMpWVYZOR`（4,400円/年） |
| Webhook | `https://fumuly.com/api/stripe/webhook` |
| Webhook ID | `we_1T7Ud072vnPgRIYVJnRyFcmY` |

### 商品の作成（参考）

Stripe Dashboard > 商品カタログ > 商品を追加

**月額プラン:**
- 商品名: `Fumuly プレミアムプラン`
- 価格: 480円（JPY）
- 請求間隔: 月次（Monthly）
- 作成後、Price ID（`price_xxx`）をコピー

**年額プラン:**
- 同じ商品に価格を追加
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
3. Vercelを再デプロイ（mainブランチにpush）
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

## 5. リマインダー・Push通知

### リマインダー

| 項目 | 詳細 |
|------|------|
| DBテーブル | `reminders` (id, user_id, document_id, remind_at, type, is_sent, created_at) |
| API | `POST/GET/DELETE /api/reminders` |
| タイプ | `in_app`（アプリ内）/ `push`（Web Push）/ `calendar`（Googleカレンダー） |
| 上限 | ユーザーあたり未送信50件まで |
| 自動送信 | Vercel Cron（15分ごと）が `/api/push/send` を呼び出し |

### Web Push通知

| 項目 | 詳細 |
|------|------|
| DBテーブル | `push_subscriptions` (id, user_id, endpoint, keys_p256dh, keys_auth, created_at) |
| Subscribe API | `POST /api/push/subscribe`（登録・更新） |
| Unsubscribe API | `DELETE /api/push/subscribe` |
| Send API | `POST /api/push/send`（Cronジョブから呼出） |
| 認証 | Cron Secretベアラートークン（`Authorization: Bearer {CRON_SECRET}`） |
| エラー処理 | 410/404エラー時に古いsubscriptionを自動削除 |

### Googleカレンダー連携

- Google Calendar URI Scheme（`https://calendar.google.com/calendar/r/eventedit`）を使用
- OAuth不要（URLを開くだけ）
- 期限が未来の日付かつ未対応・未アーカイブの書類のみ表示

### Cron設定（vercel.json）

```json
{
  "crons": [
    {
      "path": "/api/push/send",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

---

## 6. Cloudflare / メール

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

## 7. Supabase管理

### SQL実行

Management APIで実行可能（CLAUDE.md参照）。またはSupabase Dashboard > SQL Editorから直接実行。

### テーブル構成

| テーブル | 用途 |
|---------|------|
| `profiles` | ユーザー拡張情報（プラン、VIP、Stripe情報含む） |
| `documents` | スキャンした書類のAI解析結果 |
| `conversations` | チャット履歴 |
| `reminders` | リマインダー設定（期限・タイプ・送信状態） |
| `push_subscriptions` | Web Push通知のブラウザ購読情報 |

### 保護されたカラム（ユーザーが直接変更不可）

- `profiles.plan` — free/paidの切替はWebhookのみ
- `profiles.is_vip` — 管理者がDashboardで変更
- `profiles.stripe_customer_id` — Checkout API が設定
- `profiles.stripe_subscription_id` — Webhookが設定

### ユーザーデータの確認

Supabase Dashboard > Table Editor で各テーブルを直接確認・編集可能。

---

## 8. Vercel管理

### 環境変数一覧

| 変数名 | 用途 | 公開範囲 |
|--------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase接続 | フロント |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名キー | フロント |
| `NEXT_PUBLIC_APP_URL` | アプリURL | フロント |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push VAPID公開キー | フロント |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | フロント |
| `SUPABASE_URL` | Supabase接続 | バックエンド |
| `SUPABASE_SERVICE_ROLE_KEY` | DB管理者キー | バックエンド |
| `ANTHROPIC_API_KEY` | Claude API | バックエンド |
| `STRIPE_SECRET_KEY` | Stripe API | バックエンド |
| `STRIPE_WEBHOOK_SECRET` | Webhook署名検証 | バックエンド |
| `STRIPE_MONTHLY_PRICE_ID` | 月額プランID | バックエンド |
| `STRIPE_YEARLY_PRICE_ID` | 年額プランID | バックエンド |
| `ADMIN_USER_ID` | 管理者UUID | バックエンド |
| `ENCRYPTION_KEY` | チャット・書類データ暗号化キー | バックエンド |
| `VAPID_PRIVATE_KEY` | Web Push VAPID秘密キー | バックエンド |
| `CRON_SECRET` | Vercel Cron認証用シークレット | バックエンド |

### デプロイ

`main` ブランチへのpushで自動デプロイ（GitHub連携）。Vercel CLIによるデプロイは使用しない（アカウント取り違え防止のため）。

### カスタムドメイン

- `fumuly.com` → Vercelに紐付け済み（お名前ドットコムからNS委譲）
- SSL証明書はVercelが自動管理

---

## 9. レート制限まとめ

| API | 無料ユーザー | 有料/VIP | 管理者 |
|-----|------------|---------|--------|
| スキャン | 月1件 | 無制限 | 無制限 |
| チャット | 利用不可 | 20回/時 | 無制限 |
| 再生成 | 50件/日 | 50件/日 | 無制限 |

---

## 10. アーカイブ・自動クリーンアップ

| 項目 | 詳細 |
|------|------|
| アーカイブ操作 | 書類詳細画面の「アーカイブ」ボタン |
| DBカラム | `documents.is_archived` (boolean), `documents.archived_at` (timestamp) |
| 確認場所 | 設定画面 > 「過去の書類」 |
| 自動削除 | アーカイブから30日経過した書類は自動削除 |
| API | `PATCH /api/documents` with `action: "toggle_archive"` |

---

## 11. データ暗号化

| 項目 | 詳細 |
|------|------|
| 暗号化キー | 環境変数 `ENCRYPTION_KEY` |
| 暗号化対象 | チャット履歴（content）、書類のsummary・detailed_summary・recommended_action |
| 暗号化方式 | AES-256-GCM（サーバーサイド暗号化・復号） |
| 非暗号化 | sender, type, amount, deadline, category（検索・フィルタリングに使用するため平文） |

---

## 12. トラブルシューティング

### ユーザーがスキャンできない

1. profiles テーブルで `plan` / `is_vip` を確認
2. 今月のdocuments数を確認（月1件超過していないか）
3. `ADMIN_USER_ID` が正しいか確認（管理者の場合）

### Stripe決済が動かない

1. Vercelの環境変数（`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, Price ID）を確認
2. Stripe Dashboard > Webhooks でエンドポイントのステータスを確認
3. Webhook Signing Secretが一致しているか確認

### Push通知が届かない

1. 設定画面で通知がOnになっているか確認
2. `push_subscriptions` テーブルにユーザーのsubscriptionが登録されているか確認
3. `reminders` テーブルでリマインダーが作成されているか確認（`is_sent` が false のもの）
4. Vercel Dashboard > Cron Jobs でCronが正常に実行されているか確認
5. `CRON_SECRET` が正しく設定されているか確認

### チャットが制限される

- 1時間待つか、`ADMIN_USER_ID` が正しく設定されているか確認

### デプロイが失敗する

- Vercel Dashboard > Deployments でビルドログを確認
- 環境変数の漏れがないか確認（特にSupabase系）
