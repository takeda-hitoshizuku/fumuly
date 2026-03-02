---
id: task-012
title: チャット応答のMarkdownレンダリング判断
parents: [UI/UX]
status: done
depends_on: []
this_week: false
completed_at: 2026-03-01
progress: 100
note: Claudeの応答にMarkdown記法が含まれる場合の表示方針
estimated_hours: 2
---

## 概要
Claude APIの応答にはMarkdown記法（箇条書き、太字、リンク等）が含まれることがある。
現状は `whitespace-pre-wrap` でプレーンテキスト表示しているため、`**太字**` や `- リスト` がそのまま表示される。

## 選択肢

### A: Markdownレンダリングする
- react-markdown 等のライブラリを導入
- リスト・太字・リンクが見やすくなる
- Claudeの応答を最大限活かせる
- 実装コスト: ライブラリ追加 + スタイル調整

### B: プレーンテキストのまま
- システムプロンプトで「Markdown記法を使わないでください」と指示
- 追加ライブラリ不要
- 表示がシンプルで統一的
- Claudeの表現力は制限される

### C: 軽量な独自変換
- 太字・リスト・改行のみ対応する簡易パーサー
- ライブラリ不要だが保守コストあり

## 判断基準
- ADHDユーザーにとって読みやすいのはどちらか
- 箇条書きは手順案内に有用（「1. Webで申請 2. 書類を郵送」等）
- 過度な装飾は逆に読みづらい可能性

## 対象ファイル
- `app/(main)/chat/page.tsx` — メッセージ表示部分
- `app/(main)/documents/[id]/page.tsx` — detailed_summary の表示
