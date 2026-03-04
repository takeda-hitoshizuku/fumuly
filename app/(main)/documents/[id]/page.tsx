"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/fumuly/priority-badge";
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
  ArrowLeft,
  CheckCircle2,
  Archive,
  Trash2,
  Loader2,
  MessageCircle,
  Pencil,
  Check,
  Undo2,
  RefreshCw,
  Bell,
  X,
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { DocumentDetailSkeleton } from "@/components/fumuly/skeletons";

interface DocumentDetail {
  id: string;
  sender: string;
  type: string;
  amount: number | null;
  deadline: string | null;
  category: "urgent" | "action" | "keep" | "ignore";
  priority: "high" | "medium" | "low" | "ignore";
  summary: string;
  recommended_action: string;
  detailed_summary: string;
  is_done: boolean;
  done_at: string | null;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingAmount, setEditingAmount] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [savingAmount, setSavingAmount] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldInput, setFieldInput] = useState("");
  const [savingField, setSavingField] = useState(false);
  const [fieldsChanged, setFieldsChanged] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [reminders, setReminders] = useState<{ id: string; remind_at: string; type: string }[]>([]);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [savingReminder, setSavingReminder] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      const res = await fetch(`/api/documents?id=${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setDoc(data as DocumentDetail);
      }
      setLoading(false);
    };

    const fetchReminders = async () => {
      const res = await fetch(`/api/reminders?document_id=${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setReminders(
          (data || []).map((r: { id: string; remind_at: string; type: string }) => ({
            id: r.id,
            remind_at: r.remind_at,
            type: r.type,
          }))
        );
      }
    };

    fetchDocument();
    fetchReminders();
  }, [params.id]);

  const toggleDone = async () => {
    if (!doc) return;
    setUpdating(true);

    const res = await fetch("/api/documents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: doc.id, action: "toggle_done" }),
    });

    if (!res.ok) {
      alert("更新に失敗しました");
      setUpdating(false);
      return;
    }

    const updated = await res.json();
    setDoc({ ...doc, ...updated });
    setUpdating(false);
  };

  const toggleArchive = async () => {
    if (!doc) return;
    setUpdating(true);

    const res = await fetch("/api/documents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: doc.id, action: "toggle_archive" }),
    });

    if (!res.ok) {
      alert("更新に失敗しました");
      setUpdating(false);
      return;
    }

    const updated = await res.json();
    setDoc({ ...doc, ...updated });
    setUpdating(false);
  };

  const saveField = async (field: string, value: string, resetEditing = true) => {
    if (!doc) return;
    setSavingField(true);
    const res = await fetch("/api/documents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: doc.id, action: "update_fields", [field]: value || null }),
    });
    if (res.ok) {
      const updated = await res.json();
      setDoc({ ...doc, ...updated });
      setFieldsChanged(true);
    } else {
      const data = await res.json().catch(() => null);
      alert(data?.error || "保存に失敗しました");
    }
    setSavingField(false);
    if (resetEditing) setEditingField(null);
  };

  const addReminder = async (remindAt: Date) => {
    if (!doc) return;
    setSavingReminder(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: doc.id,
          remind_at: remindAt.toISOString(),
          type: "in_app",
        }),
      });
      if (res.ok) {
        const reminder = await res.json();
        setReminders((prev) => [...prev, { id: reminder.id, remind_at: reminder.remind_at, type: reminder.type }]);
        setShowReminderPicker(false);
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error || "リマインダーの設定に失敗しました");
      }
    } catch {
      alert("リマインダーの設定に失敗しました");
    }
    setSavingReminder(false);
  };

  const deleteReminder = async (reminderId: string) => {
    const res = await fetch(`/api/reminders?id=${reminderId}`, { method: "DELETE" });
    if (res.ok) {
      setReminders((prev) => prev.filter((r) => r.id !== reminderId));
    } else {
      alert("削除に失敗しました");
    }
  };

  const getReminderPresets = () => {
    if (!doc?.deadline) return [];
    const deadline = new Date(doc.deadline);
    if (isNaN(deadline.getTime())) return [];
    // JST朝9時にリマインドする（UTC+9 → UTCで0時）
    const makeDate = (base: Date, dayOffset: number) => {
      const d = new Date(base.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      d.setHours(9, 0, 0, 0); // ローカル時刻（JST）で朝9時
      return d;
    };
    const presets = [
      { label: "当日", date: makeDate(deadline, 0) },
      { label: "1日前", date: makeDate(deadline, -1) },
      { label: "3日前", date: makeDate(deadline, -3) },
      { label: "1週間前", date: makeDate(deadline, -7) },
    ];
    // 過去の日付は除外
    const now = new Date();
    return presets.filter((p) => p.date > now);
  };

  const handleRegenerate = async () => {
    if (!doc) return;
    setRegenerating(true);
    try {
      const res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: doc.sender,
          type: doc.type,
          amount: doc.amount,
          deadline: doc.deadline,
          category: doc.category,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error || "再生成に失敗しました");
        setRegenerating(false);
        return;
      }
      const regenerated = await res.json();

      // 再生成結果をDBに保存
      const saveRes = await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: doc.id,
          action: "update_summaries",
          summary: regenerated.summary,
          recommended_action: regenerated.recommended_action,
          detailed_summary: regenerated.detailed_summary,
        }),
      });
      if (saveRes.ok) {
        const updated = await saveRes.json();
        setDoc({ ...doc, ...updated });
        setFieldsChanged(false);
      } else {
        // 再生成は成功したがDB保存に失敗 → 画面は更新するが再試行可能に
        setDoc({ ...doc, ...regenerated });
        alert("サマリーは更新されましたが、保存に失敗しました。再度お試しください");
      }
    } catch {
      alert("再生成に失敗しました");
    }
    setRegenerating(false);
  };

  const handleDelete = async () => {
    if (!doc) return;
    setDeleting(true);

    const res = await fetch(`/api/documents?id=${doc.id}`, { method: "DELETE" });

    if (!res.ok) {
      alert("削除に失敗しました");
      setDeleting(false);
      return;
    }

    router.push("/documents");
  };

  if (loading) {
    return (
      <div className="px-4 pt-4 pb-24">
        <DocumentDetailSkeleton />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-sub">書類が見つかりません</p>
        <Link href="/documents" className="text-primary text-sm mt-2 inline-block">
          一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-sub mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        戻る
      </button>

      <div className="space-y-4">
        {/* Priority & status */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const categories: DocumentDetail["category"][] = ["urgent", "action", "keep", "ignore"];
              const currentIdx = categories.indexOf(doc.category);
              const next = categories[(currentIdx + 1) % categories.length];
              saveField("category", next, false);
            }}
            disabled={savingField}
            title="タップしてカテゴリを変更"
          >
            <PriorityBadge category={doc.category} size="lg" />
          </button>
          {doc.is_done && (
            <span className="flex items-center gap-1 text-sm text-keep font-medium">
              <CheckCircle2 className="h-4 w-4" />
              対応済み
            </span>
          )}
          {doc.is_archived && (
            <span className="flex items-center gap-1 text-sm text-ignore font-medium">
              <Archive className="h-4 w-4" />
              アーカイブ
            </span>
          )}
        </div>

        {/* Main info */}
        <div className="bg-white rounded-2xl border p-4 space-y-3">
          <div>
            <p className="text-xs text-sub">送付元</p>
            {editingField === "sender" ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={fieldInput}
                  onChange={(e) => setFieldInput(e.target.value)}
                  className="flex-1 font-bold text-lg text-foreground border-b-2 border-primary bg-transparent outline-none"
                  autoFocus
                />
                <button
                  onClick={() => saveField("sender", fieldInput)}
                  disabled={savingField}
                  aria-label="送付元を確定"
                  className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"
                >
                  {savingField ? <Loader2 className="h-3 w-3 animate-spin text-primary" /> : <Check className="h-4 w-4 text-primary" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-bold text-lg text-foreground">{doc.sender}</p>
                <button
                  onClick={() => { setFieldInput(doc.sender); setEditingField("sender"); }}
                  aria-label="送付元を編集"
                  className="w-7 h-7 bg-ignore/10 rounded-full flex items-center justify-center"
                >
                  <Pencil className="h-3 w-3 text-ignore" />
                </button>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-sub">書類種別</p>
            {editingField === "type" ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={fieldInput}
                  onChange={(e) => setFieldInput(e.target.value)}
                  className="flex-1 text-foreground border-b-2 border-primary bg-transparent outline-none"
                  autoFocus
                />
                <button
                  onClick={() => saveField("type", fieldInput)}
                  disabled={savingField}
                  aria-label="書類種別を確定"
                  className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"
                >
                  {savingField ? <Loader2 className="h-3 w-3 animate-spin text-primary" /> : <Check className="h-4 w-4 text-primary" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-foreground">{doc.type}</p>
                <button
                  onClick={() => { setFieldInput(doc.type); setEditingField("type"); }}
                  aria-label="書類種別を編集"
                  className="w-7 h-7 bg-ignore/10 rounded-full flex items-center justify-center"
                >
                  <Pencil className="h-3 w-3 text-ignore" />
                </button>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-sub">金額</p>
            {editingAmount ? (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-foreground">¥</span>
                <input
                  type="number"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-36 text-xl font-bold text-foreground font-[family-name:var(--font-inter)] border-b-2 border-primary bg-transparent outline-none"
                  autoFocus
                />
                <button
                  onClick={async () => {
                    const val = parseInt(amountInput, 10);
                    if (isNaN(val) || val < 0) {
                      setEditingAmount(false);
                      return;
                    }
                    setSavingAmount(true);
                    const res = await fetch("/api/documents", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: doc.id, action: "update_amount", amount: val }),
                    });
                    if (res.ok) {
                      const updated = await res.json();
                      setDoc({ ...doc, ...updated });
                      setFieldsChanged(true);
                    } else {
                      alert("保存に失敗しました");
                    }
                    setSavingAmount(false);
                    setEditingAmount(false);
                  }}
                  disabled={savingAmount}
                  aria-label="金額を確定"
                  className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"
                >
                  {savingAmount ? (
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  ) : (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              </div>
            ) : doc.amount != null ? (
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-foreground font-[family-name:var(--font-inter)]">
                  ¥{new Intl.NumberFormat("ja-JP").format(doc.amount)}
                </p>
                <button
                  onClick={() => {
                    setAmountInput(String(doc.amount));
                    setEditingAmount(true);
                  }}
                  aria-label="金額を編集"
                  className="w-7 h-7 bg-ignore/10 rounded-full flex items-center justify-center"
                >
                  <Pencil className="h-3 w-3 text-ignore" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAmountInput("");
                  setEditingAmount(true);
                }}
                className="text-sm text-primary"
              >
                + 金額を追加
              </button>
            )}
          </div>
          <div>
            <p className="text-xs text-sub">期限</p>
            {editingField === "deadline" ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={fieldInput}
                  onChange={(e) => setFieldInput(e.target.value)}
                  placeholder="例: 2026年4月30日"
                  className="flex-1 font-medium text-foreground border-b-2 border-primary bg-transparent outline-none"
                  autoFocus
                />
                <button
                  onClick={() => saveField("deadline", fieldInput)}
                  disabled={savingField}
                  aria-label="期限を確定"
                  className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"
                >
                  {savingField ? <Loader2 className="h-3 w-3 animate-spin text-primary" /> : <Check className="h-4 w-4 text-primary" />}
                </button>
              </div>
            ) : doc.deadline ? (
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">{doc.deadline}</p>
                <button
                  onClick={() => { setFieldInput(doc.deadline || ""); setEditingField("deadline"); }}
                  aria-label="期限を編集"
                  className="w-7 h-7 bg-ignore/10 rounded-full flex items-center justify-center"
                >
                  <Pencil className="h-3 w-3 text-ignore" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setFieldInput(""); setEditingField("deadline"); }}
                className="text-sm text-primary"
              >
                + 期限を追加
              </button>
            )}
          </div>
          <div>
            <p className="text-xs text-sub">一言サマリー</p>
            <p className="text-foreground">{doc.summary}</p>
          </div>
          <p className="text-[11px] text-ignore pt-1">
            AIによる読み取りです。金額・期限は原本と照合してください。
          </p>
        </div>

        {/* Regenerate button */}
        {fieldsChanged && (
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="w-full flex items-center justify-center gap-2 py-3 bg-accent/10 text-accent rounded-xl text-sm font-medium active:bg-accent/20 transition-colors disabled:opacity-50"
          >
            {regenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                サマリーを再生成中...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                内容が変更されました — サマリーを再生成
              </>
            )}
          </button>
        )}

        {/* Recommended action */}
        <div className="bg-primary/5 rounded-2xl p-4">
          <p className="text-xs text-primary font-medium mb-1">
            💡 次にすべきこと
          </p>
          <p className="text-sm text-foreground">
            {doc.recommended_action}
          </p>
        </div>

        {/* Reminder section */}
        <div className="bg-white rounded-2xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-sub flex items-center gap-1">
              <Bell className="h-3 w-3" />
              リマインダー
            </p>
            {doc.deadline && !doc.is_done && !doc.is_archived && (
              <button
                onClick={() => setShowReminderPicker(!showReminderPicker)}
                className="text-xs text-primary font-medium"
              >
                {showReminderPicker ? "閉じる" : "+ 追加"}
              </button>
            )}
          </div>

          {/* 既存リマインダー一覧 */}
          {reminders.length > 0 ? (
            <div className="space-y-2">
              {reminders.map((r) => {
                const d = new Date(r.remind_at);
                const formatted = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
                const isPast = d < new Date();
                return (
                  <div key={r.id} className="flex items-center justify-between py-1.5 px-2 bg-primary/5 rounded-lg">
                    <span className={`text-sm ${isPast ? "text-sub line-through" : "text-foreground"}`}>
                      {formatted}
                    </span>
                    <button
                      onClick={() => deleteReminder(r.id)}
                      aria-label="リマインダーを削除"
                      className="w-6 h-6 flex items-center justify-center text-sub hover:text-urgent"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-sub">
              {doc.deadline && !doc.is_done ? "リマインダーが設定されていません" : "期限のある書類にリマインダーを設定できます"}
            </p>
          )}

          {/* リマインダー追加ピッカー */}
          {showReminderPicker && (
            <div className="mt-3 pt-3 border-t space-y-2">
              <p className="text-xs text-sub">期限からの日数を選択</p>
              <div className="flex flex-wrap gap-2">
                {getReminderPresets().map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => addReminder(preset.date)}
                    disabled={savingReminder}
                    className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full active:bg-primary/20 disabled:opacity-50"
                  >
                    {preset.label}（{preset.date.getMonth() + 1}/{preset.date.getDate()}）
                  </button>
                ))}
                {getReminderPresets().length === 0 && (
                  <p className="text-xs text-sub">期限が過去または近すぎるため、選択肢がありません</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Detailed summary */}
        {doc.detailed_summary && (
          <div className="bg-white rounded-2xl border p-4">
            <p className="text-xs text-sub mb-2">詳しい説明</p>
            <div className="text-sm text-foreground leading-relaxed prose prose-sm max-w-none prose-headings:text-foreground prose-p:my-1 prose-ul:my-1 prose-li:my-0">
              <ReactMarkdown>{doc.detailed_summary}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Chat link */}
        <Link href="/chat">
          <div className="bg-white rounded-2xl border p-4 flex items-center gap-3 active:bg-background transition-colors">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                この書類について相談する
              </p>
              <p className="text-xs text-sub">
                AIに質問や相談ができます
              </p>
            </div>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {doc.is_done || doc.is_archived ? (
            /* 対応済み or アーカイブ → 「戻す」ボタン */
            <Button
              onClick={doc.is_done ? toggleDone : toggleArchive}
              disabled={updating}
              variant="outline"
              className="flex-1 h-12 rounded-xl"
            >
              {updating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Undo2 className="h-4 w-4 mr-2" />
                  {doc.is_done ? "未対応に戻す" : "アーカイブを解除"}
                </>
              )}
            </Button>
          ) : (
            /* アクティブ → 「対応済み」+「アーカイブ」ボタン */
            <>
              <Button
                onClick={toggleDone}
                disabled={updating}
                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white"
              >
                {updating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    対応済みにする
                  </>
                )}
              </Button>
              <Button
                onClick={toggleArchive}
                disabled={updating}
                variant="outline"
                aria-label="アーカイブ"
                className="h-12 px-4 rounded-xl"
              >
                <Archive className="h-4 w-4" />
              </Button>
            </>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="書類を削除"
                className="h-12 w-12 rounded-xl border-urgent/30 text-urgent hover:bg-urgent/5"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>この書類を削除しますか？</DialogTitle>
                <DialogDescription>
                  削除すると元に戻せません。
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "削除する"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
