---
id: task-058
title: 書類フィールド全編集対応（金額以外）
parents: [機能, UI/UX]
status: done
priority: medium
depends_on: [task-052]
this_week: true
completed_at: 2026-03-05
progress: 100
note: "task-052実装時にsender/type/deadline/categoryの編集機能も同時実装済み"
estimated_hours: 3
---

## 概要
書類詳細ページで金額以外のフィールド（sender, type, deadline, category）もインラインで編集可能にする。

## 現状
- 金額（amount）のみ編集可能（タップで入力→確定）
- sender, type, deadline, category は表示のみ
- PATCH `/api/documents` は既に全フィールドの更新に対応済み

## 対応方針
1. **sender（送付元）** — テキスト入力で編集
2. **type（書類種別）** — テキスト入力で編集
3. **deadline（期限）** — 日付ピッカーで編集
4. **category（カテゴリ）** — urgent/action/keep/ignore のセレクタで編集
5. 各フィールド編集後、task-052の再生成ボタンと連動

## UX方針
- 金額編集と同じパターン（タップで編集モード→確定/キャンセル）
- 変更があったフィールドをハイライト表示
- 1つでも変更があれば「サマリーを再生成」ボタンを表示（task-052）
