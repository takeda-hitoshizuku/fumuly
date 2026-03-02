---
id: task-040
title: GA4アナリティクス導入
parents: [マーケティング, インフラ]
status: done
priority: medium
depends_on: []
this_week: false
completed_at: 2026-03-02
progress: 100
note: GA4導入完了。流入分析＋コンバージョン計測対応
estimated_hours: 0.5
---

## 概要

Google Analytics 4（GA4）をFumulyに導入し、流入元の把握とコンバージョン率の計測を可能にした。

## 実装内容

### GA4の組み込み
- `@next/third-parties/google` パッケージを使用
- ルートレイアウト（`app/layout.tsx`）に `<GoogleAnalytics>` コンポーネントを追加
- 測定ID: `G-LED5D1MCK9`

### 環境変数化
- 測定IDを `NEXT_PUBLIC_GA_ID` として環境変数化
- 本番環境（Vercel）にのみ設定し、開発環境でのデータ汚染を防止
- 環境変数未設定時はGA4を読み込まない条件分岐付き

### コンバージョンイベント
- `sign_up`（method: email）: メール登録完了時に送信（`register/page.tsx`）
- `sign_up`（method: google）: Google OAuth登録時にオンボーディングページで送信（`onboarding/page.tsx`）
- `sign_up_complete`: オンボーディング完了時に送信（`onboarding/page.tsx`）

### 型定義
- `types/gtag.d.ts` を作成し、`window.gtag` の型を定義

## GA4側の設定（手動）

GA4管理画面で以下を実施する必要がある:
1. 管理 → イベント → `sign_up` と `sign_up_complete` をコンバージョンとしてマーク

## 技術的な判断
- GTMは使わずgtagスクリプトから直接イベント送信（現時点の規模ではシンプルな方が良い）
- `useSearchParams` ではなく `window.location.search` を使用（Suspense境界不要に）
- ファーストパーティクッキーで動作するため、サードパーティクッキー廃止の影響なし
