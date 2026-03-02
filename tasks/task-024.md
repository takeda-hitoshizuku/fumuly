---
id: task-024
title: 書類一覧のselect最適化
parents: [パフォーマンス]
status: waiting
priority: low
depends_on: []
this_week: false
completed_at: null
progress: 0
note: "select最適化のみ。書類データはページネーション不要（件数が限定的）"
estimated_hours: 0.1
---

## 概要

書類一覧が `.select("*")` で全カラム・全件取得している。`detailed_summary` 等の長文フィールドが不要にロードされる。

## 対象

- `app/(main)/documents/page.tsx` — 全件取得・全カラム
- `app/(main)/home/page.tsx` — 同様（ただしフィルタあり）

## 実装

### select最適化
```typescript
.select("id, sender, type, amount, deadline, category, summary, recommended_action, is_done, created_at")
```
`detailed_summary` と `priority` を一覧から除外。

## ページネーションについて（見送り）

書類データは現時点でページネーション不要。

- 現時点ではユーザー数が少なく、1ユーザーあたりの書類数も限定的
- データが増えた場合はselect最適化 + `.limit()` で十分対応可能
- 無限スクロールやページネーションUIは、実際にパフォーマンス問題が顕在化してから検討する

※ チャット履歴の件数制限（ユーザーごと最新50件を保持・超過分を自動削除）はtask-027で別途対応済み
