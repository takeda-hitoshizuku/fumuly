export type PlanKey = "monthly" | "yearly";

export type PlanDefinition = {
  name: string;
  price: string;
  unit: string;
  period: string;
  description: string;
  features: string[];
  planKey?: PlanKey;
  recommended?: boolean;
  savingBadge?: string;
};

export const paidPlans: PlanDefinition[] = [
  {
    name: "月額",
    price: "480",
    unit: "円/月",
    period: "（税込）",
    description: "書類が毎月届く方に",
    features: [
      "スキャン無制限",
      "AI書類解析",
      "AIチャット相談",
      "リマインダー通知",
      "対応履歴の保存",
    ],
    planKey: "monthly",
  },
  {
    name: "年額",
    price: "4,400",
    unit: "円/年",
    period: "（税込）",
    description: "長く使いたい方におすすめ",
    recommended: true,
    savingBadge: "1,360円おトク！",
    features: [
      "スキャン無制限",
      "AI書類解析",
      "AIチャット相談",
      "リマインダー通知",
      "対応履歴の保存",
    ],
    planKey: "yearly",
  },
];

export const freePlan: PlanDefinition = {
  name: "無料",
  price: "0",
  unit: "円",
  period: "",
  description: "まずは試してみたい方に",
  features: ["月1通までスキャン", "AI書類解析"],
};

export const allPlans: PlanDefinition[] = [freePlan, ...paidPlans];
