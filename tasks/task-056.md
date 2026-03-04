---
id: task-056
title: カレンダー連携 — Googleカレンダーに期限を登録
parents: [機能, UI/UX]
status: waiting
priority: medium
depends_on: [task-055]
this_week: true
completed_at: null
progress: 0
note: ""
estimated_hours: 2
---

## 概要
書類の期限をGoogleカレンダーにワンタップで登録できる機能。プッシュ通知なしでもカレンダーアプリ経由でリマインドを受けられる。

## 実装方針
Google Calendar URLスキームを使用（OAuth不要）。

```
https://calendar.google.com/calendar/r/eventedit?
  text=【fumuly】{書類タイトル}の期限
  &dates={開始日時}/{終了日時}
  &details={サマリー・推奨アクション}
```

## 機能要件
1. 書類詳細ページに「カレンダーに追加」ボタンを配置
2. タップでGoogleカレンダーの予定作成画面を新しいタブで開く
3. タイトル・日時・詳細が自動入力された状態で表示
4. リマインダー設定UIからも「カレンダーに追加」を選択可能

## 注意点
- iOSカレンダーには非対応（Google Calendar URLスキームのため）
- ファイルダウンロードが不要なのでゴミファイル問題なし
- 将来的にiOS対応が必要なら `.ics` を追加検討
