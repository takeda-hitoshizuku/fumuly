---
id: task-035
title: プロフィール未設定時の視覚的催促（赤ポチ＋文末メッセージ）
parents: [UI/UX, オンボーディング]
status: done
priority: medium
depends_on: []
this_week: true
completed_at: 2026-03-01
progress: 100
note: task-029（プロフィール告知バナー）の延長
estimated_hours: 3
---

## 概要

プロフィールが未設定のユーザーに対して、設定を促す視覚的なヒントを追加する。

## 実装内容

### 1. 設定アイコンに赤ポチ（バッジ）

- ボトムナビの設定タブアイコンの右上に赤い丸（バッジ）を表示
- プロフィールが未設定（income_type が null かつ monthly_income が null）の場合に表示
- 設定完了後は非表示になる

### 2. チャット・解析結果の文末メッセージ

- AIチャットの返答の末尾に「プロフィールを設定するとより精度の高いアドバイスが受けられます」的な一言を追加
- 書類解析結果の表示時にも同様のメッセージを表示
- プロフィール設定済みのユーザーには表示しない
- UIレベルで付加（APIレスポンスは変更しない）

## 実装メモ

### 変更ファイル
- `components/fumuly/bottom-nav.tsx`: pathnameの変更ごとにプロフィール完了状態を確認、設定アイコンに赤ポチ表示
- `app/(main)/chat/page.tsx`: 最後のassistant返答の下にプロフィール設定リンクを表示
- `app/(main)/scan/page.tsx`: 解析結果のアクションボタン上にプロフィール設定リンクを表示

### 判定条件
- `income_type` が null かつ `monthly_income` が null の場合にプロフィール未設定と判定（home/page.tsxと同じ条件）
