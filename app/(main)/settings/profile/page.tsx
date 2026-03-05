"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Loader2, Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const incomeTypes = [
  { value: "salary", label: "給与（会社員）" },
  { value: "pension", label: "年金" },
  { value: "welfare", label: "生活保護" },
  { value: "freelance", label: "フリーランス" },
  { value: "unemployed", label: "無職・休職中" },
  { value: "other", label: "その他" },
];

type Profile = {
  display_name: string | null;
  email: string | null;
  income_type: string | null;
  monthly_income: number | null;
  debt_total: number | null;
  has_adhd: boolean;
  phone_difficulty: boolean;
  current_situation: string | null;
  onboarding_done: boolean;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Account state
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("●●●●●●●●");
  const PASSWORD_PLACEHOLDER = "●●●●●●●●";

  // Form state
  const [incomeType, setIncomeType] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [debtTotal, setDebtTotal] = useState("");
  const [hasAdhd, setHasAdhd] = useState(false);
  const [phoneDifficulty, setPhoneDifficulty] = useState(false);
  const [currentSituation, setCurrentSituation] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        setEditing(true);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data) {
        setProfile(data);
        setDisplayName(data.display_name ?? "");
        setEmail(data.email ?? "");
        setIncomeType(data.income_type ?? "");
        setMonthlyIncome(
          data.monthly_income != null ? String(data.monthly_income) : ""
        );
        setDebtTotal(data.debt_total != null ? String(data.debt_total) : "");
        setHasAdhd(data.has_adhd ?? false);
        setPhoneDifficulty(data.phone_difficulty ?? false);
        setCurrentSituation(data.current_situation ?? "");

        // If not onboarded yet, go straight to editing
        if (!data.onboarding_done) {
          setEditing(true);
        }
      } else {
        setEditing(true);
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    const updates = {
      display_name: displayName || null,
      income_type: incomeType || null,
      monthly_income: monthlyIncome ? parseInt(monthlyIncome) : null,
      debt_total: debtTotal ? parseInt(debtTotal) : null,
      has_adhd: hasAdhd,
      phone_difficulty: phoneDifficulty,
      current_situation: currentSituation || null,
      onboarding_done: true,
    };

    try {
      // Profile update
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        let errorMessage = "保存に失敗しました";
        try {
          const data = await res.json();
          errorMessage = data.error || errorMessage;
        } catch {}
        alert(errorMessage);
        setSaving(false);
        return;
      }

      // Email update (if changed)
      if (email && email !== profile?.email) {
        const emailRes = await fetch("/api/account", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_email", email }),
        });
        if (!emailRes.ok) {
          const data = await emailRes.json().catch(() => null);
          alert(data?.error || "メールアドレスの変更に失敗しました");
          setSaving(false);
          return;
        }
      }

      // Password update (if changed from placeholder)
      if (password !== PASSWORD_PLACEHOLDER && password.length >= 6) {
        const pwRes = await fetch("/api/account", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_password", password }),
        });
        if (!pwRes.ok) {
          const data = await pwRes.json().catch(() => null);
          alert(data?.error || "パスワードの変更に失敗しました");
          setSaving(false);
          return;
        }
      }

      const savedEmail = email && email !== profile?.email ? email : (profile?.email ?? null);
      setProfile({ ...updates, email: savedEmail });
      setPassword(PASSWORD_PLACEHOLDER);
      setSaving(false);
      setEditing(false);
    } catch {
      alert("保存に失敗しました");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const incomeLabel = incomeTypes.find((t) => t.value === incomeType)?.label;

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/settings"
          className="flex items-center gap-1 text-sm text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          設定
        </Link>
        {profile?.onboarding_done && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-sm text-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
            編集
          </button>
        )}
      </div>

      <h1 className="text-xl font-bold text-foreground mb-6">
        プロフィール設定
      </h1>

      {/* Account info section (always visible) */}
      <div className="bg-white rounded-2xl border p-4 mb-6 space-y-4">
        <h2 className="text-sm font-bold text-foreground">アカウント情報</h2>

        {/* Display name */}
        <div>
          <p className="text-xs text-sub">表示名</p>
          {editing ? (
            <Input
              type="text"
              placeholder="名前を入力"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 h-10"
            />
          ) : (
            <p className="text-sm text-foreground mt-1">{profile?.display_name || "未設定"}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <p className="text-xs text-sub">メールアドレス</p>
          {editing ? (
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-10"
            />
          ) : (
            <p className="text-sm text-foreground mt-1">{profile?.email || "未設定"}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <p className="text-xs text-sub">パスワード</p>
          {editing ? (
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-10"
            />
          ) : (
            <p className="text-sm text-foreground mt-1">••••••••</p>
          )}
        </div>
      </div>

      {editing ? (
        /* Edit mode */
        <div className="space-y-8">
          {/* Income */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">収入について</h2>
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
          </section>

          {/* Debt */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">
              借金・滞納について
            </h2>
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
          </section>

          {/* Characteristics */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">
              あなたのことを教えてください
            </h2>
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
          </section>

          {/* Save */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                保存する
              </>
            )}
          </Button>
        </div>
      ) : (
        /* View mode */
        <div className="space-y-6">
          <ViewItem
            label="収入タイプ"
            value={incomeLabel ?? "未設定"}
          />
          <ViewItem
            label="月収（手取り）"
            value={
              profile?.monthly_income != null
                ? `${profile.monthly_income}万円`
                : "未設定"
            }
          />
          <ViewItem
            label="借金の総額"
            value={
              profile?.debt_total != null
                ? `${profile.debt_total}万円`
                : "未設定"
            }
          />
          <ViewItem
            label="今困っていること"
            value={profile?.current_situation || "未設定"}
          />
          <ViewItem
            label="後回しにしがち"
            value={profile?.has_adhd ? "はい" : "いいえ"}
          />
          <ViewItem
            label="電話が苦手"
            value={profile?.phone_difficulty ? "はい" : "いいえ"}
          />
        </div>
      )}
    </div>
  );
}

function ViewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border pb-3">
      <p className="text-xs text-sub">{label}</p>
      <p className="text-sm text-foreground mt-1">{value}</p>
    </div>
  );
}
