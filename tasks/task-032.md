---
id: task-032
title: 金額候補の選択 + サマリー再生成機能
parents: [UI/UX, AI]
status: done
depends_on: []
this_week: false
completed_at: 2026-03-01
progress: 100
note: Claude Vision APIの金額誤読を候補選択+再生成で解決
estimated_hours: 2
---

## 概要

Claude Vision APIが払込取扱票のマス目形式金額を正しく読み取れない問題への対応。
AIが画像内で認識した全金額を候補リストとして返し、ユーザーが正しい金額を選択→サマリーを再生成する仕組みを実装。

## 実装内容

### 1. AnalysisResult型の拡張（lib/claude.ts）
- `amount_candidates: number[]` フィールドを追加
- プロンプトに金額候補リストの出力指示を追加
- `regenerateSummary()` 関数を新規追加（テキストのみ、画像不要でコスト低い）
- フォールバック: amount_candidatesが返されなかった場合の対応

### 2. 再生成APIエンドポイント新設（app/api/regenerate/route.ts）
- POST `/api/regenerate`
- 認証チェックあり、プロフィールコンテキスト付きで再生成
- レート制限なし（テキストのみでコスト低い）

### 3. スキャン結果画面のUI変更（app/(main)/scan/page.tsx）
- 「金額を修正」ボタン → Dialog表示
- Dialog内: AI認識候補をボタンで並べる + 手入力オプション
- 金額変更後「この金額でサマリーを更新」ボタン表示
- 再生成中はローディング表示
