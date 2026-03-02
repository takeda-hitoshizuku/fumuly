"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { Loader2, ChevronRight, ChevronLeft, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const incomeTypes = [
  { value: "salary", label: "給与（会社員）" },
  { value: "pension", label: "年金" },
  { value: "welfare", label: "生活保護" },
  { value: "freelance", label: "フリーランス" },
  { value: "unemployed", label: "無職・休職中" },
  { value: "other", label: "その他" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // 新規登録時にsign_upイベントを送信（email/google両方に対応）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const method = params.get("method");
    if (method === "email" || method === "google") {
      window.gtag?.("event", "sign_up", { method });
    }
  }, []);

  // Form state
  const [incomeType, setIncomeType] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [debtTotal, setDebtTotal] = useState("");
  const [hasAdhd, setHasAdhd] = useState(false);
  const [phoneDifficulty, setPhoneDifficulty] = useState(false);
  const [currentSituation, setCurrentSituation] = useState("");

  const handleComplete = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        income_type: incomeType || null,
        monthly_income: monthlyIncome ? parseInt(monthlyIncome) : null,
        debt_total: debtTotal ? parseInt(debtTotal) : null,
        has_adhd: hasAdhd,
        phone_difficulty: phoneDifficulty,
        current_situation: currentSituation || null,
        onboarding_done: true,
      })
      .eq("id", user.id);

    if (updateError) {
      setLoading(false);
      return;
    }

    // GA4コンバージョンイベント送信（オンボーディング完了＝登録完了）
    window.gtag?.("event", "sign_up_complete");

    router.push("/home");
  };

  const steps = [
    // Step 0: Welcome / consent
    <div key="consent" className="space-y-6 text-center">
      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
        <Shield className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">
          はじめに
        </h2>
        <p className="mt-2 text-sm text-sub leading-relaxed">
          このアプリは書類の画像をAI（Anthropic Claude）に送信して解析します。
        </p>
      </div>
      <div className="bg-background rounded-xl p-4 text-left text-sm text-sub space-y-2">
        <p>・書類の画像、プロフィール情報、チャット内容がAI（Anthropic）に送信されます</p>
        <p>・画像はAI解析後に破棄され、アプリには保存されません</p>
        <p>・解析結果とチャット履歴がクラウドに保存されます</p>
      </div>
      <Button
        onClick={() => setStep(1)}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl"
      >
        同意して始める
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
      <p className="text-xs text-ignore">
        <a href="/privacy" className="underline">プライバシーポリシー</a>を確認
      </p>
    </div>,

    // Step 1: Income
    <div key="income" className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">
          収入について
        </h2>
        <p className="text-sm text-sub mt-1">
          あなたに合ったアドバイスのために教えてください（スキップ可）
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {incomeTypes.map((t) => (
          <button
            key={t.value}
            onClick={() => setIncomeType(t.value)}
            className={cn(
              "p-3 rounded-xl text-sm font-medium border transition-all",
              incomeType === t.value
                ? "bg-primary text-white border-primary"
                : "bg-white text-foreground border-border hover:border-primary/50"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {incomeType && (
        <div>
          <label className="text-sm text-sub">月収（手取り、万円）</label>
          <Input
            type="number"
            placeholder="例: 25"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            className="mt-1 h-12"
          />
        </div>
      )}
    </div>,

    // Step 2: Debt
    <div key="debt" className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">
          借金・滞納について
        </h2>
        <p className="text-sm text-sub mt-1">
          免除や猶予制度の案内に使います（スキップ可）
        </p>
      </div>
      <div>
        <label className="text-sm text-sub">借金の総額（万円）</label>
        <Input
          type="number"
          placeholder="例: 200"
          value={debtTotal}
          onChange={(e) => setDebtTotal(e.target.value)}
          className="mt-1 h-12"
        />
      </div>
      <div>
        <label className="text-sm text-sub">
          今困っていること（自由記述）
        </label>
        <Textarea
          placeholder="例: 奨学金を滞納中、住民税の差押を受けた、など"
          value={currentSituation}
          onChange={(e) => setCurrentSituation(e.target.value)}
          className="mt-1 min-h-[100px]"
        />
      </div>
    </div>,

    // Step 3: Characteristics
    <div key="traits" className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">
          あなたのことを教えてください
        </h2>
        <p className="text-sm text-sub mt-1">
          より適切なサポートのために（スキップ可）
        </p>
      </div>
      <div className="space-y-3">
        <button
          onClick={() => setHasAdhd(!hasAdhd)}
          className={cn(
            "w-full p-4 rounded-xl text-left border transition-all",
            hasAdhd
              ? "bg-primary/5 border-primary"
              : "bg-white border-border"
          )}
        >
          <p className="font-medium text-foreground">
            後回しにしがち
          </p>
          <p className="text-xs text-sub mt-0.5">
            先延ばし・書類放置・整理が苦手など
          </p>
        </button>
        <button
          onClick={() => setPhoneDifficulty(!phoneDifficulty)}
          className={cn(
            "w-full p-4 rounded-xl text-left border transition-all",
            phoneDifficulty
              ? "bg-primary/5 border-primary"
              : "bg-white border-border"
          )}
        >
          <p className="font-medium text-foreground">
            電話が苦手・できない
          </p>
          <p className="text-xs text-sub mt-0.5">
            Web・郵送・コンビニ払いなどを優先案内します
          </p>
        </button>
      </div>
    </div>,
  ];

  const isLastStep = step === steps.length - 1;

  return (
    <div className="min-h-dvh bg-background flex flex-col px-4 py-8">
      {/* Progress */}
      {step > 0 && (
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-all",
                step >= s ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>
      )}

      <div className="flex-1">{steps[step]}</div>

      {/* Navigation */}
      {step > 0 && (
        <div className="flex items-center gap-3 mt-8">
          <Button
            variant="ghost"
            onClick={() => setStep(step - 1)}
            className="text-sub"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            戻る
          </Button>
          <div className="flex-1" />
          {isLastStep ? (
            <Button
              onClick={handleComplete}
              disabled={loading}
              className="h-12 px-8 bg-accent hover:bg-accent/90 text-white rounded-xl"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "始める"
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setStep(step + 1)}
              className="h-12 px-8 bg-primary hover:bg-primary/90 text-white rounded-xl"
            >
              次へ
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Skip */}
      {step > 0 && !isLastStep && (
        <button
          onClick={() => setStep(step + 1)}
          className="mt-3 text-sm text-ignore text-center"
        >
          スキップ
        </button>
      )}
      {isLastStep && (
        <button
          onClick={handleComplete}
          className="mt-3 text-sm text-ignore text-center"
        >
          あとで設定する
        </button>
      )}
    </div>
  );
}
