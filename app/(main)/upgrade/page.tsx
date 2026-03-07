"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/fumuly/back-link";
import { Check, Sparkles, Loader2, Crown, CreditCard } from "lucide-react";
import { paidPlans, type PlanKey } from "@/lib/plans";

export default function UpgradePage() {
  const [loading, setLoading] = useState<PlanKey | null>(null);
  const [planInfo, setPlanInfo] = useState<{ plan: string; is_vip: boolean; plan_type: "monthly" | "yearly" | null } | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch("/api/stripe/subscription");
        if (res.ok) {
          const data = await res.json();
          setPlanInfo(data);
          return;
        }
      } catch {
        // ネットワークエラー
      }
      // フォールバック: 直接DBから取得
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("profiles")
          .select("plan, is_vip")
          .eq("id", user.id)
          .single();
        if (data) setPlanInfo({ ...data, plan_type: null });
      } catch {
        // フォールバックも失敗
      }
    };
    fetchPlan();
  }, []);

  const handleSubscribe = async (planKey: PlanKey) => {
    setLoading(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "エラーが発生しました");
        setLoading(null);
      }
    } catch {
      alert("エラーが発生しました。もう一度お試しください");
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "エラーが発生しました");
        setPortalLoading(false);
      }
    } catch {
      alert("エラーが発生しました");
      setPortalLoading(false);
    }
  };

  const isPaid = planInfo?.plan === "paid";
  const isVip = planInfo?.is_vip;

  return (
    <div className="px-4 pt-6 pb-24">
      <div className="mb-6">
        <BackLink />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-foreground">プランの変更</h1>
      </div>

      {/* 現在のプラン表示 */}
      <div className="bg-background rounded-2xl border p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#F4845F]/10 rounded-full flex items-center justify-center">
            {isVip ? (
              <Crown className="h-4 w-4 text-[#F4845F]" />
            ) : (
              <CreditCard className="h-4 w-4 text-[#F4845F]" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">現在のプラン</p>
            <p className="text-xs text-sub">
              {isVip
                ? "VIP（無料提供）"
                : isPaid
                  ? planInfo?.plan_type === "monthly"
                    ? "有料プラン（月額）"
                    : planInfo?.plan_type === "yearly"
                      ? "有料プラン（年額）"
                      : "有料プラン"
                  : "無料プラン（月1通まで）"}
            </p>
          </div>
        </div>
      </div>

      {/* VIPユーザー */}
      {isVip && (
        <div className="bg-[#F4845F]/5 border border-[#F4845F]/20 rounded-2xl p-5 text-center">
          <Crown className="h-8 w-8 text-[#F4845F] mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">
            VIPプランをご利用中です
          </p>
          <p className="text-xs text-sub mt-1">
            すべての機能を無制限でお使いいただけます
          </p>
        </div>
      )}

      {/* 有料ユーザー → Customer Portal */}
      {isPaid && !isVip && (
        <div className="bg-background rounded-2xl border p-5 text-center">
          <p className="text-sm text-sub mb-4">
            プランの変更・解約はStripeのポータルから行えます
          </p>
          <Button
            onClick={handlePortal}
            disabled={portalLoading}
            className="bg-[#F4845F] hover:bg-[#F4845F]/90 text-white h-11 rounded-xl"
          >
            {portalLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "プランを管理する"
            )}
          </Button>
        </div>
      )}

      {/* 無料ユーザー → アップグレード */}
      {!isPaid && !isVip && planInfo && (
        <div className="space-y-4">
          {paidPlans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border-2 p-5 ${
                plan.recommended
                  ? "border-[#F4845F] bg-[#F4845F]/5"
                  : "border-border"
              }`}
            >
              {plan.savingBadge && (
                <div className="inline-flex items-center gap-1 bg-[#F4845F] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-3">
                  <Sparkles className="h-3 w-3" />
                  {plan.savingBadge}
                </div>
              )}
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-2xl font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="text-sm text-sub">{plan.unit}</span>
                {plan.period && (
                  <span className="text-xs text-ignore">{plan.period}</span>
                )}
              </div>
              <p className="text-sm font-medium text-foreground mt-1">
                {plan.name}プラン
              </p>
              <p className="text-xs text-sub mt-0.5">{plan.description}</p>

              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-keep shrink-0" />
                    <span className="text-sub">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full mt-4 h-11 rounded-xl ${
                  plan.recommended
                    ? "bg-[#F4845F] hover:bg-[#F4845F]/90 text-white"
                    : "bg-primary hover:bg-primary/90 text-white"
                }`}
                onClick={() => handleSubscribe(plan.planKey!)}
                disabled={loading !== null}
              >
                {loading === plan.planKey! ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "アップグレードする"
                )}
              </Button>
            </div>
          ))}

          <p className="text-center text-xs text-ignore mt-2">
            有料プランはいつでも解約できます。解約後も契約期間の終了まで利用可能です。
          </p>
        </div>
      )}

      {/* ローディング中 */}
      {!planInfo && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-sub" />
        </div>
      )}
    </div>
  );
}
