---
id: task-059
title: チャット品質テスト — Playwright自動テスト + 手動チェック
parents: [品質, AI]
status: waiting
priority: low
depends_on: []
this_week: false
completed_at: null
progress: 0
note: ""
estimated_hours: 4
---

## 概要
チャット機能の回答品質をPlaywrightでスモークテスト + ユーザーによる手動チェックで検証する。

## Playwrightテスト範囲
1. チャット画面が正常に表示されるか
2. メッセージ送信→回答が返ってくるか（タイムアウトなし）
3. 特定の質問パターンに対して最低限のキーワードが含まれるか
   - 例: 「期限が近い書類は？」→ deadline関連の情報が含まれる
   - 例: 「この書類はどうすればいい？」→ recommended_action相当の内容が含まれる
4. エラー状態のハンドリング（API障害時のUI表示）

## 手動チェック項目
- AI回答のトーン（寄り添い・語りかけ）
- 具体的なアクション提示の質
- 書類コンテキストの正確な参照
- 不適切な回答（電話を勧める等）がないか

## 備考
- 回答内容の「良し悪し」は自動判定が難しいため、Playwrightは構造テストに限定
- 品質改善はプロンプトチューニングで対応（別タスク化の可能性あり）
