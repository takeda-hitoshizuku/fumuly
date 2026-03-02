---
id: task-007
title: Google認証の追加
parents: [セキュリティ]
status: done
priority: low
depends_on: []
this_week: false
completed_at: 2026-03-02
progress: 100
note: "Google OAuth認証を追加。メール/パスワード認証との併用"
estimated_hours: 3
---

## 概要
現在メール/パスワードのみ。Google OAuthを追加してログインの手間を減らす。

## 実装内容
1. Google Cloud Console でOAuth クライアントID作成
2. Supabase Dashboard → Authentication → Providers → Google を有効化
3. ログイン/登録画面に「Googleでログイン」ボタン追加
4. コールバック処理
5. 既存メールユーザーとのアカウントリンク考慮

## 作業メモ（2026-03-02）
- Google Cloud Console でプロジェクト「fumuly」を作成、OAuthクライアントIDを取得
- OAuth同意画面のサポートメールはGoogleグループ（fumuly@googlegroups.com）を使用
- Supabase Dashboard で Google プロバイダーを有効化
- ログイン画面・登録画面に「Googleでログイン/Googleで始める」ボタンを追加
- `/auth/callback` ルートでOAuthコールバック処理を実装
- メール/パスワード認証は併用として残す（テストアカウント作成のため）
- Cloudflare DNS設定も同時に実施（task-003関連）
