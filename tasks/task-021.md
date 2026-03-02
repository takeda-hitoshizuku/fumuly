---
id: task-021
title: プライバシーポリシー・同意説明の実態乖離修正
parents: [法的文書]
status: done
depends_on: []
this_week: true
completed_at: 2026-03-01
progress: 100
note: "フェーズ1: Stripe審査通過（優先1）。コードではなく文言の問題"
estimated_hours: 0.1
---

## 概要

実装が先行してプライバシーポリシーの記載が追いついていない問題を修正する。

## 乖離している箇所

### 1. Anthropicへの送信データ範囲
- **プラポリの記載**: 「書類の画像」がAnthropicで処理される
- **実態**: 解析済みテキスト（送付元・金額・期限）、プロフィール（月収・借金額・特性）、チャット会話履歴もAnthropicに送信

### 2. オンボーディングの同意説明
- **現在の記載**: 「画像はAnthropicのサーバーで処理されます」
- **実態**: テキストデータ・プロフィール情報もAnthropicに送信

### 3. アカウント削除
- **プラポリ第6条**: 「アカウントおよびすべてのデータの削除」
- **実態**: auth.usersテーブルのメアド・パスワードハッシュが残留

## 修正対象

- `docs/Fumuly_プライバシーポリシー.md`
- `app/privacy/page.tsx`
- `app/(auth)/onboarding/page.tsx` — 同意説明テキスト
- `app/(main)/settings/page.tsx` — handleDeleteAllでauth.usersも削除
