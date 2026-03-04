---
id: task-052
title: 書類詳細ページで編集後の再分析（再生成）対応
parents: [機能, UI/UX]
status: done
priority: high
depends_on: []
this_week: true
completed_at: 2026-03-05
progress: 100
note: "fieldsChanged検知+再生成ボタン+update_summariesアクション追加"
estimated_hours: 2
---

## 概要
書類詳細ページ（`/documents/[id]`）でsender/type/amount/deadline/categoryを編集した際、サマリー・推奨アクション・詳細説明が古いまま更新されない問題を解決する。

## 現状
- スキャン画面では金額変更時に `/api/regenerate` で再生成される（実装済み）
- 書類詳細ページでは各フィールドを編集してもDBのみ更新され、サマリー等は再生成されない

## 対応方針
1. 書類詳細ページでフィールド編集後に「再生成」ボタンを表示
2. ボタン押下で `/api/regenerate` を呼び出し、サマリー・推奨アクション・詳細説明を再生成
3. 再生成結果をDBに保存し、画面に反映
4. スキャン画面と同じUXパターンを踏襲（変更検知→ボタン表示→再生成→ボタン非表示）

## 影響範囲
- `app/(main)/documents/[id]/page.tsx` — 再生成ボタンと呼び出しロジック追加
- `/api/regenerate` — 既存APIをそのまま利用（変更なし）
- `/api/documents` PATCH — 再生成結果の保存（summary/recommended_action/detailed_summary更新）
