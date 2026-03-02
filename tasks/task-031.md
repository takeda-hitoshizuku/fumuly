---
id: task-031
title: 金額nullの書類に金額を追加できるようにする
parents: [UI/UX, 機能]
status: done
depends_on: []
this_week: false
completed_at: 2026-03-01
progress: 100
note: amountがnullの書類に後から金額を入力する手段がない
estimated_hours: 0.1
---

## 概要

AI解析で金額を読み取れなかった（amount: null）書類に対して、後から金額を手入力で追加する手段がない。

## 対応

### スキャン結果画面
- `result.amount == null` の場合にも「金額を追加」ボタンを表示
- タップすると金額入力モードに切り替わる

### 書類詳細画面
- `doc.amount == null` の場合にも「金額を追加」リンクを表示
- 入力→DB保存の流れはamount編集と同じ
