---
id: task-063
title: 無料ユーザーの利用可能範囲を変更（有料動機の強化）
parents: [マネタイズ]
status: done
priority: high
depends_on: []
this_week: true
completed_at: 2026-03-07
progress: 100
note: 無料枠を絞り有料転換の動機を強化（スキャン月1通、チャット有料のみ）
estimated_hours: 3
---

## 変更内容

### Before → After

| 機能 | 無料（変更前） | 無料（変更後） | 有料 |
|------|---------------|---------------|------|
| スキャン | 月5通 | 月1通 | 無制限 |
| AIチャット | 20回/時間 | 利用不可 | 20回/時間 |
| AI書類解析 | 利用可 | 利用可（スキャン時） | 利用可 |

## 実装内容

### 変更ファイル
- `lib/plans.ts`: 無料プランのfeatures（月1通までスキャン、チャット削除）
- `app/api/analyze/route.ts`: FREE_MONTHLY_LIMIT 5→1、エラーメッセージ更新
- `app/api/chat/route.ts`: 無料ユーザーのチャット利用をブロック（403 + upgrade flag）
- `app/(main)/chat/page.tsx`: 無料ユーザー向けアップグレード誘導UI（ロックアイコン + ボタン）、入力エリア非表示
- `app/(main)/upgrade/page.tsx`: 無料プラン表示「月1通まで」に更新
- `app/(main)/settings/page.tsx`: 無料プラン表示「月1通まで」に更新
- `app/legal/page.tsx`: 特商法の販売価格「月1通までスキャン」に更新、最終更新日を3/7に

### 実装詳細
- チャットAPI: `isPremiumUser()` で判定し、無料ユーザーには403を返す。レスポンスに `upgrade: true` フラグを含めてフロント側でアップグレード誘導に使える
- チャット画面: プロフィールから `plan` と `is_vip` を取得し、無料ユーザーにはLockアイコン + アップグレードボタンを表示。入力エリアは完全に非表示
- 書類詳細の「この書類について相談する」ボタンはそのまま（/chatへの単純リンクなので、チャット画面側で誘導表示される）
