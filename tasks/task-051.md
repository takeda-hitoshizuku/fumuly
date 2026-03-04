---
id: task-051
title: 収納用バーコード支払い連携機能
parents: [機能, マネタイズ]
status: omit
priority: medium
depends_on: []
this_week: false
completed_at: 2026-03-05
progress: 0
note: "PayPay/PayBのディープリンクが非公開のため実現不可。代替手段も現時点では見当たらず"
estimated_hours: 0
---

## 概要
スキャンした書類のバーコードを読み取り、アプリ内から直接支払いアプリ（PayPay/PayB等）を起動して支払いを完了させる機能。

## omitの理由
- PayPay の `paypay://pay?barcode=` ディープリンクは**非公開・未実証**（他のClaude AIセッションが推測で提示したもの）
- PayB も同様に外部からバーコード支払いを起動するディープリンクは公開されていない
- ディープリンクが使えない場合、コア価値（再スキャン不要でそのまま支払い）が成立しない
- 収納代行（Payment Collection Agency）として自前決済する場合、資金移動業ライセンスが必要で個人開発の範囲を超える

## 検討した代替アプローチ
→ 下記「支払い代替手段の調査結果」を参照

## 参考
- 仕様書: `docs/Fumuly_収納用バーコード支払い連携機能 実装仕様.md`
