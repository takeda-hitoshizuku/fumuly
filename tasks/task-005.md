---
id: task-005
title: Web Push通知・リマインダー機能の実装
parents: [機能]
status: done
priority: low
depends_on: [task-002]
this_week: false
completed_at: 2026-03-05
progress: 100
note: "task-055（リマインダー）、task-056（カレンダー連携）、task-057（プッシュ通知）で実装完了"
estimated_hours: 12
---

## 概要
書類の期限が近づいたユーザーにプッシュ通知を送る。
また、ユーザーが自分で「この日にやる」を設定できるリマインダー機能を追加する。

## DB変更
`documents` テーブルに以下を追加：
- `action_date` DATE — ユーザーが「この日にやる」と決めた日
- `remind_at` TIMESTAMP WITH TIME ZONE — リマインドする日時

## 実装内容

### リマインダー設定UI
1. 書類詳細画面に「いつやる？」ボタンを追加
2. 日付選択（今日/明日/3日後/来週/カスタム）
3. 設定した日の朝に通知

### Web Push通知
1. Service Worker の登録
2. 通知許可のリクエストUI
3. Supabase Edge Function（Cron Job）で毎日チェック
4. 以下のタイミングで通知送信：
   - 書類の期限（deadline）3日前・当日
   - ユーザー設定のaction_date当日
5. 通知タップでアプリの該当書類に遷移

### ホーム画面の改善
- 「今日やること」セクションを追加（action_dateが今日の書類を表示）
