---
id: task-045
title: 複数タブでの書類操作競合対策
parents: [バグ修正]
status: done
priority: high
depends_on: []
this_week: true
completed_at: 2026-03-05
progress: 100
note: "toggleDone/ArchiveをDB状態ベースに変更"
estimated_hours: 0.5
---

## 概要
書類詳細の `toggleDone` / `toggleArchive` がクライアントの `doc` 状態を参照して反転させているが、APIサーバー側はDBの状態を見て反転するため、複数タブで操作すると状態が矛盾する。

## 対応
- API側のレスポンスで更新後の書類データを返し、クライアントはそれで `setDoc` を上書きする
