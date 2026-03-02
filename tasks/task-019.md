---
id: task-019
title: DB操作のエラーハンドリング全般
parents: [品質, UI/UX]
status: done
priority: medium
depends_on: []
this_week: true
completed_at: 2026-03-01
progress: 100
note: "フェーズ2: アーリーアダプター（優先7）。DB操作エラーハンドリング"
estimated_hours: 0.1
---

## 概要

Supabase DB操作の結果を確認せず楽観的更新しているコード全般を修正する。

## 対象箇所

### 1. scan/page.tsx — handleSave
- getUser()がnull時にsaving=trueのまま固着
- DB insert失敗時にClaude API課金だけ発生して解析結果が消失
- try/catchなしでネットワーク障害時に無処理

### 2. documents/[id]/page.tsx — toggleDone
- DB update失敗してもUIは成功表示。リロードで元に戻る

### 3. documents/[id]/page.tsx — handleDelete
- setDeleting(false)がない（router.pushで遷移するが、遷移失敗時に固着）

### 4. settings/profile/page.tsx — プロフィール保存
- DB update失敗してもローカルstate更新済み

### 5. settings/page.tsx — handleDeleteAll
- 3つの非同期操作のどれが失敗してもerrorチェックなし
- 部分削除（会話は消えたが書類は残った）が起きうる

## 実装方針

- 各所で `{ error }` を確認し、失敗時にユーザーへ通知
- getUser() null時の早期returnでローディング状態をリセット
