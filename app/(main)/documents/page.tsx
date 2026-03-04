"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DocumentCard } from "@/components/fumuly/document-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertTriangle } from "lucide-react";

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

type Filter = "all" | "urgent" | "action" | "keep" | "ignore";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch("/api/documents?mode=all");
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

    fetchDocuments();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchDocuments();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const filtered =
    filter === "all"
      ? documents
      : documents.filter((d) => d.category === filter);

  const counts = {
    all: documents.length,
    urgent: documents.filter((d) => d.category === "urgent").length,
    action: documents.filter((d) => d.category === "action").length,
    keep: documents.filter((d) => d.category === "keep").length,
    ignore: documents.filter((d) => d.category === "ignore").length,
  };

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-xl font-bold text-foreground mb-4">
        書類一覧
      </h1>

      {/* Filter tabs */}
      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as Filter)}
        className="mb-4"
      >
        <TabsList className="w-full h-auto flex-wrap gap-1 bg-transparent p-0">
          {[
            { value: "all", label: "すべて" },
            { value: "urgent", label: "緊急" },
            { value: "action", label: "要対応" },
            { value: "keep", label: "保管" },
            { value: "ignore", label: "破棄可" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              aria-label={counts[tab.value as Filter] > 0 ? `${tab.label}（${counts[tab.value as Filter]}件）` : tab.label}
              className="text-xs px-3 py-1.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              {tab.label}
              {counts[tab.value as Filter] > 0 && (
                <span className="ml-1 text-[10px]" aria-hidden="true">
                  {counts[tab.value as Filter]}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sub">
            {filter === "all"
              ? "未対応の書類はありません"
              : "該当する書類がありません"}
          </p>
          {filter === "all" && (
            <p className="text-xs text-ignore mt-2">
              対応済み・アーカイブした書類は設定から確認できます
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} {...doc} />
          ))}
        </div>
      )}
    </div>
  );
}
