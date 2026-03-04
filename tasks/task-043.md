---
id: task-043
title: Stripe checkout/portalのOriginヘッダー信頼によるオープンリダイレクト修正
parents: [セキュリティ]
status: done
priority: high
depends_on: []
this_week: true
completed_at: 2026-03-05
progress: 100
note: "Origin ヘッダーを信頼せず NEXT_PUBLIC_APP_URL に固定する"
estimated_hours: 0.5
---

## 概要
`/api/stripe/checkout/route.ts` と `/api/stripe/portal/route.ts` で `req.headers.get("origin")` を `success_url` / `cancel_url` に使用しており、悪意あるクライアントから任意のURLにリダイレクトさせられるリスクがある。

## 対応
- `origin` の取得をやめ、`process.env.NEXT_PUBLIC_APP_URL || "https://fumuly.com"` に固定する
