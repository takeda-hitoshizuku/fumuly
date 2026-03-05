---
id: task-014
title: スマホのリマインダー・カレンダー連携
parents: [機能]
status: omit
priority: low
depends_on: [task-005]
this_week: false
completed_at: 2026-03-05
progress: 0
note: "見送り: task-056（Google Calendar URL）とtask-057（Web Push）で主要機能をカバー済み。.ics/Google OAuth方式は不要と判断"
estimated_hours: 8
---

## 概要
Fumulyで登録した書類の期限やaction_dateを、スマホのネイティブアプリに連携する。

## 方法の選択肢

### A: .ics ファイルダウンロード（最もシンプル）
- 書類詳細画面に「カレンダーに追加」ボタン
- .ics（iCalendar）ファイルを生成してダウンロード
- iOS: カレンダーアプリに追加される
- Android: Google Calendarに追加される
- 実装コスト: 低（ファイル生成のみ）
- 制約: 手動で1件ずつ追加。自動同期はできない

### B: Google Calendar API 連携
- OAuth認証でGoogleカレンダーに直接イベント追加
- 自動同期が可能
- 実装コスト: 中（OAuth + API）
- 制約: Googleアカウント必須。iOS標準カレンダーは非対応

### C: Apple Reminders / Shortcuts 連携
- iOS Shortcutsから呼び出せるURLスキームを提供
- 実装コスト: 中
- 制約: iOSのみ

## 推奨
v1.1 では A（.icsダウンロード）を実装。シンプルで両OS対応。
v2.0 で B（Google Calendar API）を検討。

## 実装内容（v1.1 .ics方式）
1. `/api/calendar/[documentId]` — .icsファイル生成API
2. 書類詳細画面に「カレンダーに追加」ボタン
3. イベント内容: タイトル（送付元+書類種別）、日時（deadline or action_date）、説明（summary + recommended_action）
4. リマインダー設定: イベントの1日前にアラート
