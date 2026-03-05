---
id: task-057
title: プッシュ通知 — Web Push APIによるリマインド通知
parents: [機能, PWA]
status: done
priority: medium
depends_on: [task-055]
this_week: true
completed_at: 2026-03-05
progress: 100
note: "VAPID鍵生成、push_subscriptionsテーブル、Service Worker pushハンドラ、subscribe/send API、設定画面トグルUI、Vercel Cron(15分間隔)実装"
estimated_hours: 6
---

## 概要
Web Push APIを使ったプッシュ通知でリマインダーを配信する。アプリを開いていなくても期限を通知できる。

## 技術要件
1. **Service Worker** — プッシュイベントの受信・通知表示
2. **VAPID鍵** — Web Push の認証に必要な公開鍵/秘密鍵ペア
3. **購読管理** — ユーザーのPush Subscription（endpoint/keys）をDBに保存
4. **サーバー送信** — Cron Job or Edge Functionで `remind_at` が到来したリマインダーを検出し、Web Push送信

## 実装範囲
1. VAPID鍵生成・環境変数設定
2. フロントエンド: 通知許可リクエスト + Subscription登録
3. DBテーブル: `push_subscriptions` テーブル追加
4. API: `POST /api/push/subscribe` — Subscription保存
5. バックエンド: Supabase Edge Function or Vercel Cron でリマインダー送信
6. Service Worker: pushイベントハンドラ追加

## iOS対応
- iOS 16.4+ Safari でWeb Push対応済み
- PWAとしてホーム画面に追加されている必要あり
- 許可フローは他アプリと同様なのでUX問題なし

## DBスキーマ案
```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, endpoint)
);
```

## デプロイ時の注意事項

### Vercelプラン要件
- `vercel.json`にCron Jobs（15分間隔）を設定しているため、**Vercel Proプラン必須**
- Hobbyプランでは1日1回制限があり、15分間隔のcronが含まれるとデプロイ自体がブロックされる
- 2026-03-05にHobby→Proへ移行して解決

### Vercel環境変数（必須）
以下がVercelに設定されていないとビルドエラーになる（`No key set vapidDetails.publicKey`）:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — VAPID公開鍵（クライアントにも埋め込まれるためNEXT_PUBLIC_プレフィックス）
- `VAPID_PRIVATE_KEY` — VAPID秘密鍵
- `CRON_SECRET` — Vercel Proでは自動生成される（手動設定不要）

## 追加改善（2026-03-05）
- 設定画面のプッシュ通知トグルUIを自作CSS実装からshadcn/ui `Switch`コンポーネントに置き換え（表示ズレ修正）
