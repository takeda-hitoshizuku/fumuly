---
id: task-037
title: プラン種別（月額/年額）の表示対応
parents: [マネタイズ, UI/UX]
status: done
priority: medium
depends_on: [task-002, task-036]
this_week: true
completed_at: 2026-03-01
progress: 100
note: "Stripe APIからサブスクリプション情報を取得し、設定画面・upgradeページで月額/年額を区別表示"
estimated_hours: 2
---

## 概要
現在DBには `plan: 'paid'` としか保存されておらず、月額か年額かの区別がつかない。
Stripe APIからSubscription情報を都度取得して、Price IDから月額/年額を判定する。

## 実装内容

### 1. `/api/stripe/subscription` API（GET）
- 認証済みユーザーのサブスクリプション情報をStripe APIから取得
- Price IDと環境変数を照合して `plan_type: 'monthly' | 'yearly' | null` を返却
- VIP・無料ユーザーは `plan_type: null`

### 2. 設定画面（`/settings`）の表示改善
- プラン表示を「有料プラン」→「有料プラン（月額）」「有料プラン（年額）」に変更
- `/api/stripe/subscription` から取得

### 3. アップグレードページ（`/upgrade`）の表示改善
- 有料ユーザーの場合に現在のプラン種別を表示

## 作業メモ

### 実装したこと
- `app/api/stripe/subscription/route.ts`: Stripe APIからSubscription情報を取得するGETエンドポイントを新規作成
  - `stripe_subscription_id` でStripeから取得 → Price IDを環境変数と照合して月額/年額を判定
  - VIP・無料ユーザーはStripe APIを呼ばず `plan_type: null` を返却
- `app/(main)/settings/page.tsx`: fetchPlanをAPI経由に変更、表示テキストに月額/年額を反映
  - フォールバックとして直接DB参照も残している
- `app/(main)/upgrade/page.tsx`: 同様にAPI経由に変更、現在のプラン種別を表示

### 設計判断
- DBスキーマ変更なし（Stripe APIをSource of Truthとして都度取得する方式を採用）
- API失敗時はフォールバックで直接DBから取得（plan_type: nullとなり「有料プラン」表示になる）
