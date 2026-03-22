---
id: task-064
title: support@fumuly.comからのメール送信対応
parents: [インフラ]
status: idea
priority: low
depends_on: []
this_week: false
completed_at: null
progress: 0
note: "現状Cloudflare Email Routingは受信転送のみ。送信時に個人Gmailが露出する問題"
estimated_hours: 2
---

## 概要

現在 `support@fumuly.com` はCloudflare Email Routingで受信→個人メールへの転送のみ対応。
返信時に個人のGmailアドレスが送信元として表示されてしまうため、`@fumuly.com` から送信できるようにする。

## 選択肢

1. **Google Workspace**（月額680円〜）— 送受信可能、管理が楽
2. **Resend + カスタムドメイン** — プログラムからの送信向き（トランザクションメール）
3. **Cloudflare + Gmail SMTP設定** — 「別のアドレスからメール送信」機能を利用。無料だが設定が面倒

## 備考

- ユーザーからの問い合わせが増えてきたタイミングで対応
- task-003（Cloudflare Email Routing設定）の延長
