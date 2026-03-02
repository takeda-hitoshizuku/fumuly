---
id: task-036
title: 料金ページ分割（公開/認証後）
parents: [マネタイズ, UI/UX]
status: done
priority: high
depends_on: [task-002]
this_week: true
completed_at: 2026-03-01
progress: 100
note: "/pricing を公開紹介ページに、/upgrade を認証済みユーザーの決済ページに分割"
estimated_hours: 3
---

## 概要
現在 `/pricing` が未ログイン・ログイン済み両方で使われており、未ログインで「アップグレードする」ボタンが表示されるUX上の問題がある。

## 実装内容

### 1. `/pricing`（公開ページ）
- プランの比較表示（マーケティング目的）
- すべてのボタンは「無料で始める」→ `/register` へ誘導
- 有料プランの価格・特徴は表示するが、直接決済には進めない

### 2. `/upgrade`（認証必須ページ）
- ログイン済みユーザー向け決済ページ
- 現在のプランを表示
- 無料ユーザー → 月額/年額の「アップグレードする」ボタン → Stripe Checkout
- 既に有料 → 「プランを管理」→ Customer Portal
- VIP → VIPステータス表示

### 3. 設定画面の修正
- `/settings` のアップグレードボタンのリンク先を `/pricing` → `/upgrade` に変更
