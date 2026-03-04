"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { DocumentCard } from "@/components/fumuly/document-card";
import { Button } from "@/components/ui/button";
import { Camera, MessageCircle, AlertTriangle, Loader2, User } from "lucide-react";
import { HomeSkeleton } from "@/components/fumuly/skeletons";

interface Document {
  id: string;
  sender: string;
  type: string;
  amount: number | null;
  deadline: string | null;
  category: "urgent" | "action" | "keep" | "ignore";
  summary: string;
  recommended_action: string;
  is_done: boolean;
}

export default function HomePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, income_type, monthly_income")
        .eq("id", user.id)
        .single();

      if (profile?.display_name) {
        setDisplayName(profile.display_name);
      }
      if (profile && !profile.income_type && profile.monthly_income == null) {
        setProfileIncomplete(true);
      }

      // Get urgent/action documents (via API for decryption)
      try {
        const res = await fetch("/api/documents?mode=home");
        if (res.ok) {
          const docs = await res.json();
          setDocuments(docs || []);
          setError(false);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
      setLoading(false);
    };

    fetchData();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const urgentCount = documents.filter((d) => d.category === "urgent").length;

  return (
    <div className="px-4 pt-6 pb-36">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-sub">
            {displayName ? `${displayName}さん` : "こんにちは"}
          </p>
          <h1 className="text-xl font-bold text-foreground">
            今日やること
          </h1>
        </div>
        {urgentCount > 0 && (
          <div className="flex items-center gap-1 bg-urgent/10 text-urgent px-3 py-1.5 rounded-full">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="text-xs font-bold">{urgentCount}件 緊急</span>
          </div>
        )}
      </div>

      {/* Profile incomplete banner */}
      {profileIncomplete && (
        <Link href="/settings/profile">
          <div className="mb-4 bg-accent/10 border border-accent/20 rounded-xl p-3 flex items-center gap-3 active:bg-accent/15 transition-colors">
            <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                プロフィールを設定しませんか？
              </p>
              <p className="text-xs text-sub">
                あなたに合ったアドバイスが受けられます
              </p>
            </div>
          </div>
        </Link>
      )}

      {loading ? (
        <HomeSkeleton />
      ) : error ? (
        <div className="text-center py-16 space-y-3">
          <AlertTriangle className="h-8 w-8 text-sub mx-auto" />
          <p className="text-sm text-sub">
            読み込みに失敗しました
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-primary underline"
          >
            再読み込み
          </button>
        </div>
      ) : documents.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16 space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center">
            <Camera className="h-8 w-8 text-primary/40" />
          </div>
          <div>
            <p className="font-bold text-foreground">
              対応が必要な書類はありません
            </p>
            <p className="text-sm text-sub mt-1">
              封筒を開けたら、写真を撮ってみましょう
            </p>
          </div>
          <Link href="/scan">
            <Button className="mt-2 bg-accent hover:bg-accent/90 text-white rounded-full px-6">
              <Camera className="h-4 w-4 mr-2" />
              書類をスキャン
            </Button>
          </Link>
        </div>
      ) : (
        /* Document list */
        <div className="space-y-4">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} {...doc} />
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-2">
        <div className="max-w-md mx-auto flex gap-2">
          <Link href="/chat" className="flex-1">
            <Button
              variant="outline"
              className="w-full h-11 rounded-full border-primary/20 text-primary"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              AIに相談
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
