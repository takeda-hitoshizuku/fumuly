---
id: task-029
title: プロフィール未入力時の告知
parents: [UI/UX]
status: done
priority: medium
depends_on: []
this_week: true
completed_at: 2026-03-01
progress: 100
note: "フェーズ2: アーリーアダプター（優先9）。プロフィール未入力告知"
estimated_hours: 0.05
---

## 概要

プロフィール未入力の場合、AI解析・チャットの品質が著しく低下する（「電話苦手」が効かず電話対応を提案する等）が、ユーザーへの告知がない。

## 実装案

- ホーム画面にプロフィール未入力時のバナー表示
  - 「プロフィールを設定すると、あなたに合ったアドバイスが受けられます」
- チャット画面にも同様の軽い告知
- プロフィールが `income_type` も `monthly_income` も未設定の場合に表示
