---
id: task-026
title: 解析結果の手動編集機能
parents: [UI/UX, 機能]
status: waiting
priority: low
depends_on: []
this_week: false
completed_at: null
progress: 0
note: "保留: task-032（金額修正）で一部解決済み。手動編集機能"
estimated_hours: 0.3
---

## 概要

AI解析結果（送付元・金額・期限・カテゴリ）を保存後に修正する手段がない。

## ユースケース

- 「保管」に分類されたが実は「要対応」だった
- 金額が読み取りミス
- 期限の年が間違っている（令和→西暦の変換ミス）

## 実装案

- 書類詳細画面に「編集」ボタン
- category / amount / deadline / sender / type を修正可能に
- summary / recommended_action / detailed_summary はAI生成のため編集不要（再スキャンで対応）
