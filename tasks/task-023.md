---
id: task-023
title: Claude JSON.parseのtry/catch追加
parents: [品質]
status: done
priority: high
depends_on: []
this_week: true
completed_at: 2026-03-01
progress: 100
note: "フェーズ2: アーリーアダプター（優先6）。JSON.parseのtry/catch"
estimated_hours: 0.02
---

## 概要

`lib/claude.ts` の `JSON.parse(cleaned)` にtry/catchがなく、ClaudeがJSON以外を返すとAPIルート全体がクラッシュする。

## 発生シナリオ

- Claudeが「この書類は〇〇です。」という前置きをJSON前に出力
- max_tokensに達してJSONが途中で切れる
- 正規表現のストリップが不完全（複数コードブロック等）

## 実装

```typescript
try {
  return JSON.parse(cleaned) as AnalysisResult;
} catch {
  throw new Error("解析結果の読み取りに失敗しました。もう一度お試しください");
}
```

## 作業メモ（2026-03-01）
- `analyzeDocument` と `regenerateSummary` の両方の `JSON.parse` にtry/catchを追加
- パース失敗時はユーザー向けの日本語エラーメッセージをthrow
