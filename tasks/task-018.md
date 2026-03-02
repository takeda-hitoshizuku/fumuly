---
id: task-018
title: パスワードリセット機能の実装
parents: [セキュリティ, UI/UX]
status: done
priority: medium
depends_on: [task-003]
this_week: false
completed_at: 2026-03-02
progress: 100
note: "パスワードリセット機能実装完了。Supabase Auth経由でリセットメール送信"
estimated_hours: 0.05
---

## 概要

ログイン画面に「パスワードを忘れた方」リンクを追加し、`supabase.auth.resetPasswordForEmail()` を実装する。

## 背景

パスワードを忘れたユーザーがアカウントにアクセスできなくなる。差押通知など重要書類を登録済みのユーザーにとって深刻。

## 実装内容

- `app/(auth)/login/page.tsx` に「パスワードをお忘れですか？」リンク追加
- パスワードリセット画面（メール入力→送信）を作成
- `supabase.auth.resetPasswordForEmail()` を呼ぶだけ（Supabaseがメール送信）
- リセット後のパスワード更新画面（コールバックURL対応）

## 備考

task-003（メール機能）に依存しない。Supabase Auth がリセットメールを送信してくれる。

## 作業メモ（2026-03-02）

### 実装内容
- `app/(auth)/login/page.tsx`: 「パスワードをお忘れですか？」リンクを追加
- `app/(auth)/reset-password/page.tsx`: メールアドレス入力→リセットメール送信ページ（新規作成）
- `app/(auth)/update-password/page.tsx`: リセットリンクから遷移→新パスワード設定ページ（新規作成）

### フロー
1. ログイン画面 →「パスワードをお忘れですか？」クリック
2. `/reset-password` でメールアドレスを入力して送信
3. Supabase Auth が `resetPasswordForEmail()` でリセットメールを送信
4. メール内リンクをクリック → `/update-password` に遷移（URLハッシュにトークン付き）
5. `setSession()` でセッション復元後、`updateUser()` で新パスワードを設定
6. 成功後2秒で `/home` にリダイレクト
