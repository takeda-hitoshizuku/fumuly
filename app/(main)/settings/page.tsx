"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Shield,
  FileText,
  Scale,
  AlertTriangle,
  Trash2,
  LogOut,
  Loader2,
  ChevronRight,
  CreditCard,
  Crown,
  BookOpen,
  Archive,
} from "lucide-react";
import Link from "next/link";

type PlanInfo = {
  plan: string;
  is_vip: boolean;
  plan_type: "monthly" | "yearly" | null;
};

export default function SettingsPage() {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [upgraded, setUpgraded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "true") {
      setUpgraded(true);
    }
  }, []);

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

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDeleteAll = async () => {
    setDeleting(true);

    try {
      const res = await fetch("/api/delete-account", { method: "POST" });
      if (!res.ok) {
        let errorMessage = "削除に失敗しました";
        try {
          const data = await res.json();
          errorMessage = data.error || errorMessage;
        } catch {
          // JSONパース失敗時はデフォルトメッセージを使用
        }
        alert(errorMessage);
        setDeleting(false);
        return;
      }

      await supabase.auth.signOut();
      window.location.href = "/";
    } catch {
      alert("削除に失敗しました");
      setDeleting(false);
    }
  };

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-xl font-bold text-foreground mb-6">
        設定
      </h1>

      {/* Plan section */}
      {upgraded && (
        <div className="bg-keep/10 border border-keep/20 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-keep">
            アップグレードありがとうございます！有料プランが有効になりました。
          </p>
        </div>
      )}

      <div className="bg-background rounded-2xl border p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F4845F]/10 rounded-full flex items-center justify-center">
              {planInfo?.is_vip ? (
                <Crown className="h-4 w-4 text-[#F4845F]" />
              ) : (
                <CreditCard className="h-4 w-4 text-[#F4845F]" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                現在のプラン
              </p>
              <p className="text-xs text-sub">
                {!planInfo
                  ? "読み込み中..."
                  : planInfo.is_vip
                    ? "VIP（無料提供）"
                    : planInfo.plan === "paid"
                      ? planInfo.plan_type === "monthly"
                        ? "有料プラン（月額）"
                        : planInfo.plan_type === "yearly"
                          ? "有料プラン（年額）"
                          : "有料プラン"
                      : "無料プラン（月5通まで）"}
              </p>
            </div>
          </div>
          {planInfo?.is_vip ? (
            <span className="text-xs font-bold text-[#F4845F] bg-[#F4845F]/10 px-2.5 py-1 rounded-full">
              VIP
            </span>
          ) : planInfo?.plan === "paid" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePortal}
              disabled={portalLoading}
              className="text-xs"
            >
              {portalLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "プラン管理"
              )}
            </Button>
          ) : planInfo ? (
            <Link href="/upgrade">
              <Button
                size="sm"
                className="bg-[#F4845F] hover:bg-[#F4845F]/90 text-white text-xs"
              >
                アップグレード
              </Button>
            </Link>
          ) : null}
        </div>
      </div>

      <div className="space-y-1">
        {/* Profile */}
        <Link href="/settings/profile">
          <div className="flex items-center gap-3 py-3 active:bg-background rounded-lg px-2 transition-colors">
            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                プロフィール設定
              </p>
              <p className="text-xs text-sub">
                収入・借金・特性の情報を変更
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-ignore" />
          </div>
        </Link>

        <Separator />

        {/* Guide */}
        <Link href="/guide">
          <div className="flex items-center gap-3 py-3 active:bg-background rounded-lg px-2 transition-colors">
            <div className="w-9 h-9 bg-[#2C4A7C]/10 rounded-full flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-[#2C4A7C]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                使い方ガイド
              </p>
              <p className="text-xs text-sub">
                機能や使い方の説明
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-ignore" />
          </div>
        </Link>

        <Separator />

        {/* Past documents */}
        <Link href="/settings/past-documents">
          <div className="flex items-center gap-3 py-3 active:bg-background rounded-lg px-2 transition-colors">
            <div className="w-9 h-9 bg-ignore/10 rounded-full flex items-center justify-center">
              <Archive className="h-4 w-4 text-ignore" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                過去の書類
              </p>
              <p className="text-xs text-sub">
                対応済み・アーカイブした書類
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-ignore" />
          </div>
        </Link>

        <Separator />

        {/* Privacy */}
        <Link href="/privacy">
          <div className="flex items-center gap-3 py-3 active:bg-background rounded-lg px-2 transition-colors">
            <div className="w-9 h-9 bg-keep/10 rounded-full flex items-center justify-center">
              <Shield className="h-4 w-4 text-keep" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                プライバシーポリシー
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-ignore" />
          </div>
        </Link>

        <Separator />

        {/* Terms */}
        <Link href="/terms">
          <div className="flex items-center gap-3 py-3 active:bg-background rounded-lg px-2 transition-colors">
            <div className="w-9 h-9 bg-action/10 rounded-full flex items-center justify-center">
              <FileText className="h-4 w-4 text-action" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                利用規約
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-ignore" />
          </div>
        </Link>

        <Separator />

        {/* Disclaimer */}
        <Link href="/disclaimer">
          <div className="flex items-center gap-3 py-3 active:bg-background rounded-lg px-2 transition-colors">
            <div className="w-9 h-9 bg-urgent/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-urgent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                免責事項
              </p>
              <p className="text-xs text-sub">
                AI解析の精度・責任範囲について
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-ignore" />
          </div>
        </Link>

        <Separator />

        {/* Legal (特商法) */}
        <Link href="/legal">
          <div className="flex items-center gap-3 py-3 active:bg-background rounded-lg px-2 transition-colors">
            <div className="w-9 h-9 bg-ignore/10 rounded-full flex items-center justify-center">
              <Scale className="h-4 w-4 text-ignore" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                特定商取引法に基づく表記
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-ignore" />
          </div>
        </Link>

        <Separator />

        {/* Delete data — Dialog外出しでhydrationエラーを回避 */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="w-full flex items-center gap-3 py-3 active:bg-background rounded-lg px-2 transition-colors">
              <div className="w-9 h-9 bg-urgent/10 rounded-full flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-urgent" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-urgent">
                  すべてのデータを削除
                </p>
                <p className="text-xs text-sub">
                  書類・会話履歴・プロフィールを削除
                </p>
              </div>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>本当にすべてのデータを削除しますか？</DialogTitle>
              <DialogDescription>
                書類の解析結果、会話履歴、プロフィール情報がすべて削除されます。この操作は元に戻せません。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={handleDeleteAll}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "すべて削除する"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Logout */}
      <div className="mt-8">
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full h-12 rounded-xl"
        >
          {loggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <LogOut className="h-4 w-4 mr-2" />
              ログアウト
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
