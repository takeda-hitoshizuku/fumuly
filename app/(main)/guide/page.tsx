import { BackLink } from "@/components/fumuly/back-link";
import {
  Camera,
  Sparkles,
  MessageCircle,
  BookOpen,
  FileText,
  Shield,
  CircleDot,
  Footprints,
  Smartphone,
  Image,
  Search,
  Heart,
  Trash2,
  CheckCircle,
} from "lucide-react";

export default function GuidePage() {
  return (
    <div className="px-4 pt-6 pb-8">
      <BackLink />

      <h1 className="text-xl font-bold text-[#2D2D2D] mt-4 mb-6">
        使い方ガイド
      </h1>

      {/* コンセプト */}
      <section className="bg-white rounded-2xl p-5 mb-4 border border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-[#2C4A7C]/10 rounded-lg flex items-center justify-center">
            <Heart className="h-4 w-4 text-[#2C4A7C]" />
          </div>
          <h2 className="font-bold text-[#2D2D2D]">Fumulyとは</h2>
        </div>
        <p className="text-sm text-[#757575] leading-relaxed">
          「封筒、無理ー！」を解決するアプリ。書類や手続きを後回しにしがちな人のために、AIが書類を読んで、整理して、次にやることを教えてくれます。
        </p>
      </section>

      {/* 3ステップ */}
      <section className="bg-white rounded-2xl p-5 mb-4 border border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-[#F4845F]/10 rounded-lg flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-[#F4845F]" />
          </div>
          <h2 className="font-bold text-[#2D2D2D]">使い方（3ステップ）</h2>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 bg-[#F4845F]/10 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-[#F4845F]">1</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#2D2D2D] flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-[#F4845F]" />
                写真を撮る
              </h3>
              <p className="text-sm text-[#757575] mt-1">
                封筒の中身をスマホで撮影。複数ページがあれば追加撮影（最大5枚）。ライブラリからの選択もOK。
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 bg-[#2C4A7C]/10 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-[#2C4A7C]">2</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#2D2D2D] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#2C4A7C]" />
                AIが読む
              </h3>
              <p className="text-sm text-[#757575] mt-1">
                送付元、金額、期限を自動抽出。緊急度を色で表示。「次にすべきこと」を具体的に提示します。
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 bg-keep/10 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-keep">3</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#2D2D2D] flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-keep" />
                相談する
              </h3>
              <p className="text-sm text-[#757575] mt-1">
                わからないことはAIチャットで質問。あなたの状況を踏まえて、電話なしでできる対処法を案内します。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 機能紹介 */}
      <section className="bg-white rounded-2xl p-5 mb-4 border border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-[#2C4A7C]/10 rounded-lg flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-[#2C4A7C]" />
          </div>
          <h2 className="font-bold text-[#2D2D2D]">主な機能</h2>
        </div>

        <div className="space-y-5">
          {/* 書類スキャン */}
          <div>
            <h3 className="font-bold text-sm text-[#2D2D2D] mb-2 flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-[#F4845F]" />
              書類スキャン（AI解析）
            </h3>
            <ul className="space-y-1.5 text-sm text-[#757575]">
              <li className="flex items-start gap-2">
                <Smartphone className="h-3.5 w-3.5 mt-0.5 shrink-0 text-ignore" />
                スマホのカメラで撮影（最大5枚・裏表対応）
              </li>
              <li className="flex items-start gap-2">
                <Image className="h-3.5 w-3.5 mt-0.5 shrink-0 text-ignore" />
                ライブラリから既存の写真も選択可能
              </li>
              <li className="flex items-start gap-2">
                <Search className="h-3.5 w-3.5 mt-0.5 shrink-0 text-ignore" />
                送付元・書類種別・金額・期限・緊急度を自動抽出
              </li>
              <li className="flex items-start gap-2">
                <Footprints className="h-3.5 w-3.5 mt-0.5 shrink-0 text-ignore" />
                次にすべき具体的なアクションを提示
              </li>
            </ul>
          </div>

          {/* 書類管理 */}
          <div>
            <h3 className="font-bold text-sm text-[#2D2D2D] mb-2 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-[#2C4A7C]" />
              書類管理
            </h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-urgent shrink-0" />
                <span className="text-[#757575]">
                  <span className="font-medium text-[#2D2D2D]">緊急対応</span>
                  　差押、強制執行、最終通告など
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-action shrink-0" />
                <span className="text-[#757575]">
                  <span className="font-medium text-[#2D2D2D]">要対応</span>
                  　督促、申請期限ありなど
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-keep shrink-0" />
                <span className="text-[#757575]">
                  <span className="font-medium text-[#2D2D2D]">保管</span>
                  　証明書、通知書など
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-ignore shrink-0" />
                <span className="text-[#757575]">
                  <span className="font-medium text-[#2D2D2D]">破棄可</span>
                  　DM、広告など
                </span>
              </div>
            </div>
            <ul className="mt-2 space-y-1.5 text-sm text-[#757575]">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-ignore" />
                「対応済み」マークで管理
              </li>
              <li className="flex items-start gap-2">
                <Trash2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-ignore" />
                不要な書類は削除可能
              </li>
            </ul>
          </div>

          {/* AIチャット */}
          <div>
            <h3 className="font-bold text-sm text-[#2D2D2D] mb-2 flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4 text-keep" />
              AIチャット相談
              <span className="text-[10px] font-normal text-[#F4845F] ml-1">有料プラン</span>
            </h3>
            <ul className="space-y-1.5 text-sm text-[#757575]">
              <li className="flex items-start gap-2">
                <CircleDot className="h-3.5 w-3.5 mt-0.5 shrink-0 text-ignore" />
                書類のこと、手続きの方法、お金の不安について相談可能
              </li>
              <li className="flex items-start gap-2">
                <CircleDot className="h-3.5 w-3.5 mt-0.5 shrink-0 text-ignore" />
                登録済みの書類データとプロフィールを踏まえた回答
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0 text-ignore" />
                電話不要の手段（Web申請・コンビニ払い・郵送）を優先案内
              </li>
            </ul>
            <div className="mt-3 bg-[#F7F8FA] rounded-xl p-3 space-y-1.5">
              <p className="text-xs text-[#2C4A7C] font-medium">
                こんな質問ができます
              </p>
              <p className="text-xs text-[#757575]">
                「期限が近い書類はある？」
              </p>
              <p className="text-xs text-[#757575]">
                「奨学金の猶予申請ってどうやるの？」
              </p>
              <p className="text-xs text-[#757575]">
                「差押を受けたらどうすればいい？」
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 対応書類 */}
      <section className="bg-white rounded-2xl p-5 mb-4 border border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-action/10 rounded-lg flex items-center justify-center">
            <FileText className="h-4 w-4 text-action" />
          </div>
          <h2 className="font-bold text-[#2D2D2D]">対応する書類の例</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-[#757575]">
          <div className="bg-[#F7F8FA] rounded-lg px-3 py-2">税金の督促状</div>
          <div className="bg-[#F7F8FA] rounded-lg px-3 py-2">差押通知</div>
          <div className="bg-[#F7F8FA] rounded-lg px-3 py-2">年金・保険の通知</div>
          <div className="bg-[#F7F8FA] rounded-lg px-3 py-2">奨学金の返還通知</div>
          <div className="bg-[#F7F8FA] rounded-lg px-3 py-2">公共料金の請求書</div>
          <div className="bg-[#F7F8FA] rounded-lg px-3 py-2">裁判所からの書類</div>
          <div className="bg-[#F7F8FA] rounded-lg px-3 py-2">役所からの通知</div>
          <div className="bg-[#F7F8FA] rounded-lg px-3 py-2">DM・広告</div>
        </div>
      </section>

      {/* その他 */}
      <section className="bg-white rounded-2xl p-5 border border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-keep/10 rounded-lg flex items-center justify-center">
            <Shield className="h-4 w-4 text-keep" />
          </div>
          <h2 className="font-bold text-[#2D2D2D]">安心のポイント</h2>
        </div>
        <ul className="space-y-2 text-sm text-[#757575]">
          <li className="flex items-start gap-2">
            <Smartphone className="h-3.5 w-3.5 mt-0.5 shrink-0 text-ignore" />
            <span>
              <span className="font-medium text-[#2D2D2D]">PWA対応</span>
              ：ホーム画面に追加してアプリとして使える
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0 text-ignore" />
            <span>
              <span className="font-medium text-[#2D2D2D]">プライバシー</span>
              ：撮影した画像はサーバーに保存しません（解析結果のテキストのみ保存）
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
