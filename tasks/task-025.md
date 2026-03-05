---
id: task-025
title: 重複スキャン検知
parents: [UI/UX, AI]
status: done
priority: low
depends_on: []
this_week: false
completed_at: 2026-03-03
progress: 100
note: A案（sender+type+amount一致チェック）で実装。保存前に警告ダイアログ表示
estimated_hours: 0.2
---

## 概要

同じ書類を二度スキャンすると二件登録される。重複検知がない。

## リスク

ADHDユーザーが同じ督促状を何度もスキャンし、「緊急書類が5件ある！」とパニックになる可能性。Fumulyのターゲットユーザーにとって深刻。

## 検知方法の案

### A案: sender + type + amount + deadline の一致チェック
- 保存前にDBクエリで既存チェック
- 一致時に「この書類はすでに登録されています。上書きしますか？」と確認

### B案: 画像ハッシュ
- 画像のperceptual hashを保存・比較
- 大掛かりだが正確

### C案: Claude解析結果のsummary類似度
- より柔軟だが実装コスト高

## 推奨

A案で十分。sender + type + amount の3条件一致で警告を出す。

## 実装内容

### 変更ファイル
- `app/api/documents/route.ts` - `check_duplicate` モード追加
- `app/(main)/scan/page.tsx` - 重複警告ダイアログ追加

### 実装内容
- 保存前に `/api/documents?mode=check_duplicate` で既存書類を検索
- `sender` + `type` + `amount` の一致 かつ `is_done = false` かつ `is_archived = false`（アクティブな書類のみ対象）
- 重複がある場合、「似た書類が登録済みです」ダイアログを表示し、既存書類の情報を一覧表示
- ユーザーが「それでも登録する」を選べば保存続行
- 重複チェック失敗時はそのまま保存に進む（チェック不能で保存できないことを防止）
