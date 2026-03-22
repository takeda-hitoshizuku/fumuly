import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QRSection } from "@/components/fumuly/qr-section";
import { PwaInstallSection } from "@/components/fumuly/pwa-install-section";
import { allPlans } from "@/lib/plans";
import {
  Camera,
  Shield,
  Bell,
  ChevronRight,
  Mail,
  Sparkles,
  Heart,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Fumuly（フムリー）| 封筒、無理ー！を解決するAIアプリ",
  description:
    "届いた封筒、写真を撮るだけでAIが書類を読んで整理。督促状・年金・税金・保険、何をすべきか教えてくれる。電話なしの対処法を優先案内。ADHD・一人暮らしの書類管理に。",
  keywords: [
    "Fumuly",
    "フムリー",
    "封筒管理",
    "書類管理アプリ",
    "AI書類解析",
    "督促状",
    "年金",
    "税金",
    "ADHD",
    "一人暮らし",
  ],
  alternates: {
    canonical: "https://fumuly.com",
  },
  openGraph: {
    title: "Fumuly（フムリー）| 封筒、無理ー！を解決するAIアプリ",
    description:
      "届いた封筒、写真を撮るだけでAIが書類を読んで整理。督促も年金も、何をすべきか教えてくれる。",
    url: "https://fumuly.com",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
          <span className="text-xl font-bold text-[#2C4A7C]">Fumuly</span>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/pricing" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm" className="text-[#2C4A7C]">
                料金
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-[#2C4A7C]">
                ログイン
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="bg-[#F4845F] hover:bg-[#F4845F]/90 text-white"
              >
                無料で始める
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-background to-white">
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Text content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 bg-[#2C4A7C]/10 text-[#2C4A7C] rounded-full px-3 py-1 text-sm font-medium mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                書類が苦手なあなたのためのアプリ
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2D2D] leading-tight">
                封筒、無理ー！
                <br />
                <span className="text-[#2C4A7C]">を解決する。</span>
              </h1>
              <p className="mt-4 text-[#757575] text-base sm:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
                写真を撮るだけでAIが書類を読んで整理。
                <br />
                督促も、年金も、何をすべきか教えてくれる。
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-3">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-[#F4845F] hover:bg-[#F4845F]/90 text-white text-base px-8 h-12 rounded-full shadow-lg"
                  >
                    無料で始める
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-xs text-ignore">
                  クレジットカード不要・1分で登録
                </p>
              </div>
            </div>

            {/* Phone mockup */}
            <div className="mt-12 lg:mt-0 mx-auto max-w-xs">
              <div className="bg-[#F7F8FA] rounded-3xl border-2 border-[#E5E7EB] p-4 shadow-xl">
                <div className="space-y-3">
                  {/* Mock urgent card */}
                  <div className="bg-urgent-bg rounded-xl p-3 text-left border border-urgent/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="bg-urgent text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        緊急対応
                      </span>
                    </div>
                    <p className="font-bold text-sm text-[#2D2D2D]">
                      八王子市 徴収課
                    </p>
                    <p className="text-xs text-[#757575]">差押調書（謄本）</p>
                    <p className="text-xs text-[#2C4A7C] mt-1 bg-white/60 rounded px-2 py-1">
                      💡 市役所の窓口で分割納付の相談ができます
                    </p>
                  </div>
                  {/* Mock action card */}
                  <div className="bg-action-bg rounded-xl p-3 text-left border border-action/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="bg-action text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        要対応
                      </span>
                    </div>
                    <p className="font-bold text-sm text-[#2D2D2D]">JASSO</p>
                    <p className="text-xs text-[#757575]">奨学金返還の督促</p>
                    <p className="text-xs text-[#2C4A7C] mt-1 bg-white/60 rounded px-2 py-1">
                      💡 Webから猶予申請が可能です
                    </p>
                  </div>
                  {/* Mock keep card */}
                  <div className="bg-keep-bg rounded-xl p-3 text-left border border-keep/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="bg-keep text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        保管
                      </span>
                    </div>
                    <p className="font-bold text-sm text-[#2D2D2D]">
                      日本年金機構
                    </p>
                    <p className="text-xs text-[#757575]">被保険者資格通知</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Empathy / Story — ヒーロー直後で共感を深める */}
      <section className="py-14 lg:py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg lg:text-xl text-[#2D2D2D] leading-relaxed">
            「机の上の封筒、何日も開けてなかった。
            <br />
            <span className="text-urgent font-bold">
              差押の通知
            </span>
            が混ざってたなんて知らなかった」
          </p>
          <p className="mt-6 text-sm text-[#757575] leading-relaxed">
            ── そんな経験から生まれたアプリです。
            <br />
            開けられなかった封筒、Fumulyが代わりに読みます。
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 lg:py-24 bg-[#F7F8FA]">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-[#2D2D2D] mb-12 lg:mb-16">
            使い方は、たったの3ステップ
          </h2>
        </div>
        {/* Snap scroll on mobile, grid on PC */}
        <div className="flex snap-x snap-mandatory overflow-x-auto gap-5 px-[calc((100vw-60vw)/2)] pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible sm:snap-none sm:gap-8 lg:gap-12 sm:px-4 sm:max-w-3xl sm:mx-auto scrollbar-hide">
          {/* Step 1: 写真を撮る */}
          <div className="snap-center shrink-0 w-[60vw] sm:w-auto flex flex-col items-center text-center">
            <div className="text-sm font-bold text-[#F4845F] mb-3">Step 1</div>
            <h3 className="font-bold text-[#2D2D2D] mb-1">写真を撮る</h3>
            <p className="text-sm text-[#757575] mb-4">
              封筒の中身をスマホで撮影。
              <br />
              開封するだけでOK。
            </p>
            {/* Phone mockup - Scan */}
            <div className="w-[220px] bg-white rounded-[28px] border-2 border-[#E5E7EB] shadow-xl overflow-hidden">
              <div className="h-5 bg-[#F7F8FA] flex items-center justify-center">
                <div className="w-16 h-1.5 bg-[#E5E7EB] rounded-full" />
              </div>
              <div className="px-3 pt-3 pb-4">
                <p className="text-[11px] font-bold text-[#2D2D2D] mb-2">書類をスキャン</p>
                <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl aspect-[4/3] flex flex-col items-center justify-center gap-1.5">
                  <div className="w-8 h-8 bg-[#F4845F]/10 rounded-full flex items-center justify-center">
                    <Camera className="h-4 w-4 text-[#F4845F]" />
                  </div>
                  <p className="text-[9px] text-[#757575]">タップして撮影</p>
                </div>
                <div className="mt-2 flex items-center justify-center gap-1 text-[9px] text-[#757575]">
                  <Camera className="h-2.5 w-2.5" />
                  ライブラリから選択
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: AIが読む */}
          <div className="snap-center shrink-0 w-[60vw] sm:w-auto flex flex-col items-center text-center">
            <div className="text-sm font-bold text-[#2C4A7C] mb-3">Step 2</div>
            <h3 className="font-bold text-[#2D2D2D] mb-1">AIが読む</h3>
            <p className="text-sm text-[#757575] mb-4">
              送付元、金額、期限を自動抽出。
              <br />
              緊急度を色で表示。
            </p>
            {/* Phone mockup - Document detail */}
            <div className="w-[220px] bg-white rounded-[28px] border-2 border-[#E5E7EB] shadow-xl overflow-hidden">
              <div className="h-5 bg-[#F7F8FA] flex items-center justify-center">
                <div className="w-16 h-1.5 bg-[#E5E7EB] rounded-full" />
              </div>
              <div className="px-3 pt-2 pb-4 text-left">
                <span className="inline-block bg-urgent text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold mb-1.5">
                  緊急対応
                </span>
                <div className="bg-[#F7F8FA] rounded-lg p-2 mb-2 space-y-1.5">
                  <div>
                    <p className="text-[8px] text-[#757575]">送付元</p>
                    <p className="text-[10px] font-bold text-[#2D2D2D]">さくら市納税課</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-[#757575]">金額</p>
                    <p className="text-[10px] font-bold text-[#2D2D2D]">¥42,000</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-[#757575]">期限</p>
                    <p className="text-[10px] font-bold text-urgent">2026-09-30</p>
                  </div>
                </div>
                <div className="bg-[#FFF8F0] rounded-lg p-2">
                  <p className="text-[8px] font-bold text-[#F4845F] mb-0.5">次にすべきこと</p>
                  <p className="text-[8px] text-[#757575] leading-relaxed">
                    コンビニ・銀行で納付書を使って支払う。またはWebサイトで分割納付の相談を。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: 相談する */}
          <div className="snap-center shrink-0 w-[60vw] sm:w-auto flex flex-col items-center text-center">
            <div className="text-sm font-bold text-keep mb-3">Step 3</div>
            <h3 className="font-bold text-[#2D2D2D] mb-1">相談する</h3>
            <p className="text-sm text-[#757575] mb-4">
              「これどうすれば？」をAIに相談。
              <br />
              電話なしの対処法を案内。
            </p>
            {/* Phone mockup - Chat */}
            <div className="w-[220px] bg-white rounded-[28px] border-2 border-[#E5E7EB] shadow-xl overflow-hidden">
              <div className="h-5 bg-[#F7F8FA] flex items-center justify-center">
                <div className="w-16 h-1.5 bg-[#E5E7EB] rounded-full" />
              </div>
              <div className="px-3 pt-2 pb-4">
                <p className="text-[11px] font-bold text-[#2D2D2D] mb-2">AIに相談</p>
                <div className="space-y-2">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-[#2C4A7C] text-white text-[8px] rounded-xl rounded-br-sm px-2.5 py-1.5 max-w-[75%]">
                      督促状が届いたけど怖い
                    </div>
                  </div>
                  {/* AI message */}
                  <div className="flex justify-start">
                    <div className="bg-[#F7F8FA] text-[#2D2D2D] text-[8px] rounded-xl rounded-bl-sm px-2.5 py-1.5 max-w-[85%] leading-relaxed">
                      <p className="font-bold mb-0.5">大丈夫、まだ間に合います。</p>
                      <p>まずはコンビニで納付書を使って支払えます。分割も相談可能です。</p>
                      <p className="text-[#2C4A7C] mt-1">電話不要でWebから申請できます</p>
                    </div>
                  </div>
                </div>
                {/* Input */}
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="flex-1 bg-[#F7F8FA] rounded-lg px-2 py-1 text-[8px] text-[#B0B0B0]">
                    メッセージを入力...
                  </div>
                  <div className="w-5 h-5 bg-[#2C4A7C] rounded-md flex items-center justify-center shrink-0">
                    <ChevronRight className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-[#2D2D2D] mb-12 lg:mb-16">
            Fumulyがあなたを守る
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
            <div className="bg-[#F7F8FA] rounded-2xl p-5 lg:p-7">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-urgent/10 rounded-xl flex items-center justify-center mb-3">
                <Bell className="h-5 w-5 lg:h-6 lg:w-6 text-urgent" />
              </div>
              <h3 className="font-bold text-[#2D2D2D] mb-1 lg:text-lg">
                期限を見逃さない
              </h3>
              <p className="text-sm text-[#757575]">
                差押や督促など、緊急の書類を自動で最優先表示。
                期限が近づくとリマインドします。
              </p>
            </div>
            <div className="bg-[#F7F8FA] rounded-2xl p-5 lg:p-7">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#2C4A7C]/10 rounded-xl flex items-center justify-center mb-3">
                <Shield className="h-5 w-5 lg:h-6 lg:w-6 text-[#2C4A7C]" />
              </div>
              <h3 className="font-bold text-[#2D2D2D] mb-1 lg:text-lg">
                電話しなくていい
              </h3>
              <p className="text-sm text-[#757575]">
                Web申請、コンビニ払い、郵送など
                電話不要の対処法を優先的にご案内。
              </p>
            </div>
            <div className="bg-[#F7F8FA] rounded-2xl p-5 lg:p-7">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-action/10 rounded-xl flex items-center justify-center mb-3">
                <Heart className="h-5 w-5 lg:h-6 lg:w-6 text-action" />
              </div>
              <h3 className="font-bold text-[#2D2D2D] mb-1 lg:text-lg">
                あなたの状況を理解する
              </h3>
              <p className="text-sm text-[#757575]">
                収入、借金、あなたの特性を踏まえて、
                あなたに合ったアドバイスを提供。
              </p>
            </div>
            <div className="bg-[#F7F8FA] rounded-2xl p-5 lg:p-7">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-keep/10 rounded-xl flex items-center justify-center mb-3">
                <Mail className="h-5 w-5 lg:h-6 lg:w-6 text-keep" />
              </div>
              <h3 className="font-bold text-[#2D2D2D] mb-1 lg:text-lg">
                「読まなくていい」も教える
              </h3>
              <p className="text-sm text-[#757575]">
                DMや広告は「無視OK」と明確に判定。
                大事な書類だけに集中できます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 lg:py-24 px-4 bg-[#F7F8FA]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-[#2D2D2D] mb-4">
            料金プラン
          </h2>
          <p className="text-center text-[#757575] text-sm mb-10 lg:mb-14">
            無料で始めて、必要なときにアップグレード
          </p>
          <div className="grid sm:grid-cols-3 gap-4 lg:gap-6 max-w-3xl mx-auto">
            {allPlans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl p-5 lg:p-6 text-center shadow-sm ${
                  plan.recommended
                    ? "border-2 border-[#F4845F] ring-1 ring-[#F4845F]/20"
                    : "border border-[#E5E7EB]"
                }`}
              >
                {plan.savingBadge ? (
                  <span className="inline-block bg-[#F4845F] text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                    {plan.savingBadge}
                  </span>
                ) : (
                  <div className="h-[26px] mb-3" />
                )}
                <h3 className="font-bold text-[#2D2D2D] text-lg">
                  {plan.name}
                </h3>
                <p className="mt-2">
                  <span className="text-2xl lg:text-3xl font-bold text-[#2C4A7C]">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[#757575]">
                    {plan.unit}
                  </span>
                </p>
                <p className="text-xs text-[#757575] mt-1">
                  {plan.description}
                </p>
                <p className="text-xs text-[#2C4A7C] font-medium mt-3">
                  {plan.features[0]}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-[#F4845F] hover:bg-[#F4845F]/90 text-white text-base px-8 h-12 rounded-full shadow-lg"
              >
                無料で始める
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                variant="outline"
                className="text-[#2C4A7C] border-[#2C4A7C] hover:bg-[#2C4A7C]/5"
              >
                プランの詳細を見る
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* PWA Install Guide */}
      <PwaInstallSection />

      {/* CTA */}
      <section className="py-16 lg:py-24 px-4 bg-[#2C4A7C] text-white text-center">
        <h2 className="text-2xl lg:text-3xl font-bold mb-3">
          封筒を開けるのは、あなた。
          <br />
          中身を読むのは、Fumuly。
        </h2>
        <p className="text-white/70 mb-8 text-sm">
          まずは1通、写真を撮ってみてください。
        </p>
        <Link href="/register">
          <Button
            size="lg"
            className="bg-[#F4845F] hover:bg-[#F4845F]/90 text-white text-base px-8 h-12 rounded-full shadow-lg"
          >
            無料で始める
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* QR Code (PC only) — CTA後に配置 */}
      <QRSection />

      {/* Footer */}
      <footer className="py-8 px-4 bg-[#F7F8FA] text-center">
        <p className="text-sm text-[#757575]">
          © 2026 Fumuly. All rights reserved.
        </p>
        <div className="mt-2 flex items-center justify-center gap-4 text-xs text-ignore">
          <Link href="/pricing" className="hover:text-[#757575]">
            料金プラン
          </Link>
          <Link href="/privacy" className="hover:text-[#757575]">
            プライバシーポリシー
          </Link>
          <Link href="/terms" className="hover:text-[#757575]">
            利用規約
          </Link>
          <Link href="/legal" className="hover:text-[#757575]">
            特定商取引法
          </Link>
        </div>
      </footer>
    </div>
  );
}
