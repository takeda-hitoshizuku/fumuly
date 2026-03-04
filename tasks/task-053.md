---
id: task-053
title: PWA改善 — アプリアイコン表示修正
parents: [PWA, UI/UX]
status: done
priority: medium
depends_on: []
this_week: true
completed_at: 2026-03-05
progress: 100
note: "apple-touch-icon明示 + manifest purpose追加。maskableは現アイコンだと端が切れるため見送り"
estimated_hours: 1
---

## 概要
ホーム画面に追加した際のアプリアイコンが正しく表示されない問題を修正する。

## 対応方針
1. 現在のアイコン設定（manifest.json / apple-touch-icon）の状態を確認
2. 各サイズのアイコンが正しく配置・参照されているか検証
3. iOS / Android それぞれでホーム画面追加時のアイコン表示を確認
4. 必要に応じてアイコン画像の再生成・manifest修正
