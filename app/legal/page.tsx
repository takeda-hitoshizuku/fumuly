import { BackLink } from "@/components/fumuly/back-link";

const rows = [
  { label: "販売業者", value: "E-margin" },
  { label: "代表者", value: "武田 昌之" },
  { label: "所在地", value: "〒193-0821 東京都八王子市川町244-32" },
  { label: "電話番号", value: "090-3720-8018（お問い合わせ対応：平日10:00〜18:00）" },
  {
    label: "メールアドレス",
    value: "support@fumuly.com（お問い合わせ対応：平日10:00〜18:00）",
  },
  { label: "サービス名", value: "Fumuly（フムリー）" },
  { label: "サービスURL", value: "https://fumuly.com" },
  {
    label: "サービス概要",
    value:
      "AIを活用した郵便物・書類の管理支援サービス。書類をスキャンしてAIが内容を解析し、期限管理や対応方法のアドバイスを提供します",
  },
  {
    label: "販売価格",
    value:
      "無料プラン：0円（月5通まで）／月額プラン：480円（税込）／年額プラン：4,400円（税込）",
  },
  {
    label: "支払方法",
    value:
      "クレジットカード決済（Visa・Mastercard・American Express・JCB・Diners Club・Discover）",
  },
  {
    label: "支払時期",
    value:
      "有料プラン申込時に即時決済。以降、契約期間に応じて自動更新時に決済",
  },
  {
    label: "サービス提供時期",
    value: "決済完了後、直ちにご利用いただけます",
  },
  {
    label: "返品・キャンセル",
    value:
      "デジタルサービスの性質上、原則として返金はいたしません。ただし、システムの重大な不具合等によりサービスが提供できなかった場合は、個別に対応いたします。有料プランはいつでも解約可能で、解約後は契約期間の終了まで引き続きご利用いただけます。解約はアプリ内の設定画面から行えます",
  },
  {
    label: "追加手数料",
    value: "なし",
  },
  {
    label: "動作環境",
    value:
      "モダンブラウザ（Chrome、Safari、Edge、Firefox の最新版）。インターネット接続が必要です",
  },
  { label: "特別な販売条件", value: "なし" },
];

export default function LegalPage() {
  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto flex items-center px-4 h-14">
          <BackLink />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-foreground mb-6">
          特定商取引法に基づく表記
        </h1>

        <div className="border rounded-xl overflow-hidden">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`flex ${i !== 0 ? "border-t" : ""}`}
            >
              <div className="w-32 sm:w-40 shrink-0 bg-muted px-4 py-3 text-sm font-medium text-foreground">
                {row.label}
              </div>
              <div className="px-4 py-3 text-sm text-sub">{row.value}</div>
            </div>
          ))}
        </div>

        <p className="text-xs text-ignore mt-6">制定日：2026年2月23日 ／ 最終更新日：2026年3月5日</p>
      </div>
    </div>
  );
}
