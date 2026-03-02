---
id: task-041
title: 書類のアーカイブ機能と自動クリーンアップ
parents: [UX, プライバシー]
status: idea
priority: medium
depends_on: []
this_week: false
completed_at: null
progress: 0
note: "一覧のスッキリ化 + 30日後の自動削除で個人情報保持を最小限に"
estimated_hours: 3
---

## 概要

書類の状態管理を見直し、一覧画面をスッキリさせつつ、不要な個人情報の保持期間を最小限にする。

## 背景

- 現状は対応済みにしても一覧に残り続け、書類が増えるとうっとおしい
- 差押金額・滞納額など極めてセンシティブな情報を永久保持する必要がない
- データ容量（Supabase無料枠500MB）の観点からも不要データは削除したい

## 設計

### 書類の状態遷移

| 状態 | 意味 | 表示場所 | 自動削除 |
|------|------|---------|---------|
| アクティブ | 未対応 | ホーム + 一覧 | 対象外（永久保持） |
| 対応済み（is_done） | ちゃんとやった | 設定 > 過去の書類（デフォルトタブ） | 30日後に削除 |
| アーカイブ（is_archived） | 対応しない/不要 | 設定 > 過去の書類（アーカイブタブ） | 30日後に削除 |
| 削除 | 完全に不要 | なし | 即時物理削除 |

### UI変更

- **一覧画面**: アクティブな書類（未対応 & 未アーカイブ）のみ表示
- **ホーム画面**: 変更なし（urgent/actionの未対応のみ、既存通り）
- **設定画面**: 「過去の書類」セクションを追加
  - デフォルトタブ: 対応済み一覧
  - アーカイブタブ: アーカイブ一覧
  - 各書類に「○日後に自動削除されます」の表示
- **詳細画面**: 「対応済み」「アーカイブ」「削除」の3操作

### DB変更

```sql
ALTER TABLE documents ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;
-- is_doneがtrueになった日時も記録が必要
ALTER TABLE documents ADD COLUMN done_at TIMESTAMP WITH TIME ZONE;
```

### 自動クリーンアップ（30日ルール）

- 対応済み（is_done=true）から30日経過 → 物理削除
- アーカイブ（is_archived=true）から30日経過 → 物理削除
- アクティブな書類は削除対象外
- 実行タイミング: スキャンAPI or ログイン時にユーザーごとに実行（Cron不要）

### 自動削除の理由

1. **プライバシー**: 借金額・差押状況など極めてセンシティブな個人情報の保持を最小限にする
2. **データ容量**: Supabase無料枠の範囲内で運用を維持する
