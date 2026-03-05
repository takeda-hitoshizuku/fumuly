---
id: task-061
title: sitemap.xml / robots.txt の作成（Search Console対応）
parents: [インフラ, マーケティング]
status: done
priority: medium
depends_on: []
this_week: false
completed_at: 2026-03-05
progress: 100
note: Next.js App Router の sitemap.ts / robots.ts で実装済み
estimated_hours: 1
---

## 概要

Google Search Console登録に必要な sitemap.xml と robots.txt を作成する。

## 実装内容

### sitemap.ts (`app/sitemap.ts`)
- 公開ページ6件を登録
  - `/` (LP) - priority: 1, weekly
  - `/pricing` - priority: 0.8, monthly
  - `/guide` - priority: 0.7, monthly
  - `/privacy` - priority: 0.3, yearly
  - `/terms` - priority: 0.3, yearly
  - `/legal` - priority: 0.3, yearly

### robots.ts (`app/robots.ts`)
- Allow: `/`, `/pricing`, `/guide`, `/privacy`, `/terms`, `/legal`
- Disallow: 認証必要ページ（`/home`, `/chat`, `/scan`, `/settings` 等）、`/api/`
- Sitemap: `https://fumuly.com/sitemap.xml`

## 作業メモ

- Next.js App Router の `MetadataRoute.Sitemap` / `MetadataRoute.Robots` 型を使用
- 静的ファイルではなくTS関数で生成（将来的な動的ページ追加に対応可能）
- 2026-03-05 実装・コミット済み
