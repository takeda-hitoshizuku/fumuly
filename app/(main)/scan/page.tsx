"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { PriorityBadge } from "@/components/fumuly/priority-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Camera,
  X,
  Loader2,
  RotateCcw,
  Save,
  ImagePlus,
  Plus,
  Check,
  RefreshCw,
  Settings,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/claude";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { resizeImage } from "@/lib/image";

interface CapturedImage {
  preview: string; // dataURL for display
  base64: string; // base64 data for API
}

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ScanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [amountDialogOpen, setAmountDialogOpen] = useState(false);
  const [manualInput, setManualInput] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [originalAmount, setOriginalAmount] = useState<number | null>(null);
  const analyzeAbortRef = useRef<AbortController | null>(null);
  const [amountChanged, setAmountChanged] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicates, setDuplicates] = useState<{ id: string; sender: string; type: string; amount: number | null; created_at: string }[]>([]);

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("income_type, monthly_income")
        .eq("id", user.id)
        .single();
      if (profile && !profile.income_type && profile.monthly_income == null) {
        setProfileIncomplete(true);
      }
    };
    checkProfile();
  }, []);

  const processFile = async (file: File) => {
    if (file.size > MAX_IMAGE_SIZE) {
      alert("画像サイズが大きすぎます（10MB以下にしてください）");
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target?.result as string);
      reader.onerror = () => reject(new Error("ファイルの読み取りに失敗しました"));
      reader.readAsDataURL(file);
    });

    const resized = await resizeImage(dataUrl);
    const base64 = resized.split(",")[1];

    setImages((prev) => {
      if (prev.length >= MAX_IMAGES) {
        alert(`画像は${MAX_IMAGES}枚までです`);
        return prev;
      }
      return [...prev, { preview: resized, base64 }];
    });
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file).catch(() => {
      alert("画像の処理に失敗しました。別の画像をお試しください。");
    });
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    return () => {
      analyzeAbortRef.current?.abort();
    };
  }, []);

  const handleAnalyze = async () => {
    if (images.length === 0) return;
    setAnalyzing(true);
    analyzeAbortRef.current?.abort();
    const abortController = new AbortController();
    analyzeAbortRef.current = abortController;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: images.map((img) => img.base64) }),
        signal: abortController.signal,
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (res.status === 429) {
        const err = await res.json();
        alert(err.error || "利用回数の上限に達しました。しばらくしてからお試しください。");
        return;
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "サーバーエラーが発生しました");
      }
      const data = await res.json();
      if (data.error === "not_a_document") {
        alert("書類として認識できませんでした。封筒の中身やハガキなど、書類を撮影してください。");
        return;
      }
      setResult(data);
      setOriginalAmount(data.amount);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const isOffline = !navigator.onLine;
      const message = isOffline
        ? "ネットワークに接続されていないようです。接続を確認してからもう一度お試しください。"
        : err instanceof Error
          ? err.message
          : "解析に失敗しました。もう一度お試しください";
      alert(message);
    } finally {
      setAnalyzing(false);
    }
  };

  const saveDocument = async () => {
    if (!result) return;
    setSaving(true);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: result.sender,
          type: result.type,
          amount: result.amount,
          deadline: result.deadline,
          action_required: result.action_required,
          priority: result.priority,
          category: result.category,
          summary: result.summary,
          recommended_action: result.recommended_action,
          detailed_summary: result.detailed_summary,
        }),
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

      router.push("/home");
    } catch {
      alert("保存に失敗しました");
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;

    // 重複チェック
    try {
      const params = new URLSearchParams({ mode: "check_duplicate" });
      if (result.sender) params.set("sender", result.sender);
      if (result.type) params.set("type", result.type);
      if (result.amount != null) params.set("amount", String(result.amount));

      const res = await fetch(`/api/documents?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.duplicates && data.duplicates.length > 0) {
          setDuplicates(data.duplicates);
          setDuplicateDialogOpen(true);
          return;
        }
      }
    } catch {
      // 重複チェック失敗時はそのまま保存に進む
    }

    saveDocument();
  };

  const handleSelectAmount = (amount: number) => {
    if (!result) return;
    setResult({ ...result, amount });
    setAmountChanged(amount !== originalAmount);
    setAmountDialogOpen(false);
    setManualInput(false);
  };

  const handleRegenerate = async () => {
    if (!result) return;
    setRegenerating(true);
    try {
      const res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: result.sender,
          type: result.type,
          amount: result.amount,
          deadline: result.deadline,
          category: result.category,
        }),
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (res.status === 429) {
        const err = await res.json();
        alert(err.error || "再生成の上限に達しました。しばらくしてからお試しください。");
        return;
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "再生成に失敗しました");
      }
      const data = await res.json();
      setResult({
        ...result,
        summary: data.summary,
        recommended_action: data.recommended_action,
        detailed_summary: data.detailed_summary,
      });
      setAmountChanged(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "サマリーの更新に失敗しました。もう一度お試しください。");
    } finally {
      setRegenerating(false);
    }
  };

  const handleRetake = () => {
    setImages([]);
    setResult(null);
    setAmountChanged(false);
    setOriginalAmount(null);
  };

  // Analysis result view
  if (result) {
    return (
      <div className="px-4 pt-6 pb-24">
        <h1 className="text-lg font-bold text-foreground mb-2">
          解析結果
        </h1>
        <p className="text-xs text-sub mb-4">
          AIによる読み取りです。金額・期限は必ず原本と照合してください。
        </p>
        <div className="space-y-4">
          {/* Priority */}
          <div className="flex items-center gap-3">
            <PriorityBadge category={result.category} size="lg" />
          </div>

          {/* Summary card */}
          <div className="bg-white rounded-2xl border p-4 space-y-3">
            <div>
              <p className="text-xs text-sub">送付元</p>
              <p className="font-bold text-foreground">
                {result.sender}
              </p>
            </div>
            <div>
              <p className="text-xs text-sub">書類種別</p>
              <p className="text-foreground">{result.type}</p>
            </div>
            <div>
              <p className="text-xs text-sub">金額</p>
              <div className="flex items-center gap-2">
                {result.amount != null ? (
                  <p className="text-lg font-bold text-foreground font-[family-name:var(--font-inter)]">
                    ¥{new Intl.NumberFormat("ja-JP").format(result.amount)}
                  </p>
                ) : (
                  <p className="text-sm text-sub">なし</p>
                )}
                <button
                  onClick={() => {
                    setAmountInput(result.amount != null ? String(result.amount) : "");
                    setManualInput(false);
                    setAmountDialogOpen(true);
                  }}
                  className="text-xs text-primary border border-primary/30 rounded-full px-2.5 py-0.5"
                >
                  金額を修正
                </button>
              </div>
            </div>
            {result.deadline && (
              <div>
                <p className="text-xs text-sub">期限</p>
                <p className="font-medium text-foreground">
                  {result.deadline}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-sub">一言サマリー</p>
              <p className="text-foreground">{result.summary}</p>
            </div>
          </div>

          {/* Regenerate button */}
          {amountChanged && (
            <Button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="w-full h-10 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm"
            >
              {regenerating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  サマリーを更新中...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  この金額でサマリーを更新
                </div>
              )}
            </Button>
          )}

          {/* Recommended action */}
          <div className="bg-primary/5 rounded-2xl p-4">
            <p className="text-xs text-primary font-medium mb-1">
              💡 次にすべきこと
            </p>
            <p className="text-sm text-foreground">
              {result.recommended_action}
            </p>
          </div>

          {/* Detailed summary */}
          {result.detailed_summary && (
            <div className="bg-white rounded-2xl border p-4">
              <p className="text-xs text-sub mb-2">詳しい説明</p>
              <div className="text-sm text-foreground leading-relaxed prose prose-sm max-w-none prose-headings:text-foreground prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                <ReactMarkdown>{result.detailed_summary}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Profile prompt */}
          {profileIncomplete && (
            <Link href="/settings/profile" className="flex items-center gap-2 text-xs text-primary bg-primary/5 rounded-xl px-4 py-3 hover:bg-primary/10 transition-colors">
              <Settings className="h-3.5 w-3.5 shrink-0" />
              プロフィールを設定すると、あなたの状況に合ったアドバイスが受けられます
            </Link>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleRetake}
              className="flex-1 h-12 rounded-xl"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              撮り直す
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white rounded-xl"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  保存する
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Amount correction dialog */}
        <Dialog open={amountDialogOpen} onOpenChange={setAmountDialogOpen}>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle>金額を修正</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              {/* Candidates */}
              {result.amount_candidates.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-sub">AIが読み取った金額候補</p>
                  <div className="grid grid-cols-1 gap-2">
                    {result.amount_candidates.map((candidate) => (
                      <button
                        key={candidate}
                        onClick={() => handleSelectAmount(candidate)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-[family-name:var(--font-inter)] transition-colors ${
                          result.amount === candidate
                            ? "border-primary bg-primary/5 font-bold text-primary"
                            : "border-border bg-white hover:bg-muted"
                        }`}
                      >
                        <span className="font-bold">
                          ¥{new Intl.NumberFormat("ja-JP").format(candidate)}
                        </span>
                        {result.amount === candidate && (
                          <span className="ml-2 text-xs text-primary">（選択中）</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual input */}
              <div className="space-y-2">
                {!manualInput ? (
                  <button
                    onClick={() => setManualInput(true)}
                    className="w-full text-center text-sm text-primary py-2"
                  >
                    手入力で金額を指定
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-sub">金額を入力</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-foreground">¥</span>
                      <input
                        type="number"
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        placeholder="0"
                        className="flex-1 text-lg font-bold text-foreground font-[family-name:var(--font-inter)] border-b-2 border-primary bg-transparent outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          const val = parseInt(amountInput, 10);
                          if (!isNaN(val) && val >= 0) {
                            handleSelectAmount(val);
                          }
                        }}
                        aria-label="金額を確定"
                        className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"
                      >
                        <Check className="h-4 w-4 text-primary" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Duplicate warning dialog */}
        <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle>似た書類が登録済みです</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-1">
              <p className="text-sm text-sub">
                同じ送付元・種別・金額の書類がすでにあります。それでも登録しますか？
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {duplicates.map((d) => (
                  <div key={d.id} className="bg-muted rounded-xl px-3 py-2 text-sm">
                    <p className="font-medium text-foreground">{d.sender} / {d.type}</p>
                    <p className="text-xs text-sub">
                      {d.amount != null && `¥${new Intl.NumberFormat("ja-JP").format(d.amount)} · `}
                      {new Date(d.created_at).toLocaleDateString("ja-JP")}登録
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setDuplicateDialogOpen(false)}
                  className="flex-1 h-10 rounded-xl"
                >
                  やめる
                </Button>
                <Button
                  onClick={() => {
                    setDuplicateDialogOpen(false);
                    saveDocument();
                  }}
                  className="flex-1 h-10 bg-primary hover:bg-primary/90 text-white rounded-xl"
                >
                  登録する
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Camera / capture view
  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-lg font-bold text-foreground mb-4">
        書類をスキャン
      </h1>

      {images.length === 0 ? (
        <div className="space-y-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-3/4 bg-white rounded-2xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-3 active:bg-primary/5 transition-colors"
          >
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
              <Camera className="h-7 w-7 text-accent" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                タップして撮影
              </p>
              <p className="text-xs text-sub mt-1">
                書類を平らに置いて撮影してください
              </p>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCapture}
            className="hidden"
          />
          <button
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) =>
                handleCapture(
                  e as unknown as React.ChangeEvent<HTMLInputElement>
                );
              input.click();
            }}
            className="w-full flex items-center justify-center gap-2 text-sm text-sub py-2"
          >
            <ImagePlus className="h-4 w-4" />
            ライブラリから選択
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image thumbnails */}
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-3/4">
                <img
                  src={img.preview}
                  alt={`書類 ${i + 1}`}
                  className="w-full h-full object-cover rounded-xl border"
                />
                <button
                  onClick={() => handleRemoveImage(i)}
                  aria-label={`画像${i + 1}を削除`}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
                <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {i + 1}/{images.length}
                </span>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                onClick={() => addInputRef.current?.click()}
                className="aspect-3/4 bg-white rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-1 active:bg-primary/5 transition-colors"
              >
                <Plus className="h-5 w-5 text-primary" />
                <span className="text-[10px] text-sub">追加</span>
              </button>
            )}
          </div>

          <input
            ref={addInputRef}
            type="file"
            accept="image/*"
            onChange={handleCapture}
            className="hidden"
          />

          <p className="text-center text-xs text-sub">
            裏面や別ページがあれば追加してください（最大{MAX_IMAGES}枚）
          </p>

          {/* Analyze button */}
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full h-12 bg-accent hover:bg-accent/90 text-white rounded-xl text-base"
          >
            {analyzing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                AIが読んでいます...
              </div>
            ) : (
              `解析する${images.length > 1 ? `（${images.length}枚）` : ""}`
            )}
          </Button>

          {analyzing && (
            <p className="text-center text-xs text-sub">
              書類の内容を読み取っています。少しお待ちください。
            </p>
          )}
        </div>
      )}
    </div>
  );
}
