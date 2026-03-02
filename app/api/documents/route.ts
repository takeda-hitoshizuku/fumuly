import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { encrypt, decrypt, encryptFields, decryptFields } from "@/lib/encryption";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ENCRYPTED_DOC_FIELDS = ["summary", "detailed_summary", "recommended_action"] as const;

function getUser(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
      },
    }
  );
}

// GET: Fetch documents (with decryption)
export async function GET(req: NextRequest) {
  try {
    const supabaseClient = getUser(req);
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode"); // "home" | "all" | null
    const id = searchParams.get("id"); // single document

    // fire-and-forget: 自動クリーンアップ
    runAutoCleanup(user.id);

    if (id) {
      // Single document
      const { data } = await supabaseAdmin
        .from("documents")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (!data) {
        return NextResponse.json({ error: "見つかりません" }, { status: 404 });
      }

      const decrypted = decryptFields(data, [...ENCRYPTED_DOC_FIELDS]);
      return NextResponse.json(decrypted);
    }

    if (mode === "home") {
      // Home: urgent/action, not done, not archived, limit 10
      const { data } = await supabaseAdmin
        .from("documents")
        .select("id, sender, type, amount, deadline, category, summary, recommended_action, is_done")
        .eq("user_id", user.id)
        .eq("is_done", false)
        .eq("is_archived", false)
        .in("category", ["urgent", "action"])
        .order("deadline", { ascending: true, nullsFirst: false })
        .limit(10);

      const docs = (data || []).map((d) => decryptFields(d, ["summary", "recommended_action"]));
      return NextResponse.json(docs);
    }

    if (mode === "past") {
      // Past documents: done or archived
      const { data } = await supabaseAdmin
        .from("documents")
        .select("id, sender, type, amount, deadline, category, summary, recommended_action, is_done, is_archived, done_at, archived_at, created_at")
        .eq("user_id", user.id)
        .or("is_done.eq.true,is_archived.eq.true")
        .order("created_at", { ascending: false });

      const docs = (data || []).map((d) => decryptFields(d, ["summary", "recommended_action"]));
      return NextResponse.json(docs);
    }

    // All active documents (not done, not archived)
    const { data } = await supabaseAdmin
      .from("documents")
      .select("id, sender, type, amount, deadline, category, summary, recommended_action, is_done, created_at")
      .eq("user_id", user.id)
      .eq("is_done", false)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    const docs = (data || []).map((d) => decryptFields(d, ["summary", "recommended_action"]));
    return NextResponse.json(docs);
  } catch (error) {
    console.error("Documents GET error:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

// 自動クリーンアップ: 対応済み/アーカイブから30日経過した書類を削除
async function runAutoCleanup(userId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { error: err1 } = await supabaseAdmin
    .from("documents")
    .delete()
    .eq("user_id", userId)
    .eq("is_done", true)
    .not("done_at", "is", null)
    .lt("done_at", thirtyDaysAgo);
  if (err1) console.error("Cleanup (done) error:", err1);

  const { error: err2 } = await supabaseAdmin
    .from("documents")
    .delete()
    .eq("user_id", userId)
    .eq("is_archived", true)
    .not("archived_at", "is", null)
    .lt("archived_at", thirtyDaysAgo);
  if (err2) console.error("Cleanup (archived) error:", err2);
}

// POST: Save new document (with encryption)
export async function POST(req: NextRequest) {
  try {
    const supabaseClient = getUser(req);
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await req.json();
    const doc = {
      user_id: user.id,
      sender: body.sender,
      type: body.type,
      amount: body.amount,
      deadline: body.deadline,
      action_required: body.action_required,
      priority: body.priority,
      category: body.category,
      summary: body.summary,
      recommended_action: body.recommended_action,
      detailed_summary: body.detailed_summary,
    };

    const encrypted = encryptFields(doc, [...ENCRYPTED_DOC_FIELDS]);
    const { error } = await supabaseAdmin.from("documents").insert(encrypted);

    if (error) {
      console.error("Document save error:", error);
      return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
    }

    runAutoCleanup(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Documents POST error:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

// PATCH: Update document (toggle done/archive, update amount)
export async function PATCH(req: NextRequest) {
  try {
    const supabaseClient = getUser(req);
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await req.json();
    const { id, action, amount } = body;

    if (!id) {
      return NextResponse.json({ error: "IDが必要です" }, { status: 400 });
    }

    // user_idの一致を確認
    const { data: existing } = await supabaseAdmin
      .from("documents")
      .select("id, is_done, is_archived")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "見つかりません" }, { status: 404 });
    }

    let updateData: Record<string, unknown> = {};

    if (action === "toggle_done") {
      const newDone = !existing.is_done;
      updateData = {
        is_done: newDone,
        done_at: newDone ? new Date().toISOString() : null,
        // 排他制御: 対応済みにする場合はアーカイブを解除
        ...(newDone ? { is_archived: false, archived_at: null } : {}),
      };
    } else if (action === "toggle_archive") {
      const newArchived = !existing.is_archived;
      updateData = {
        is_archived: newArchived,
        archived_at: newArchived ? new Date().toISOString() : null,
        // 排他制御: アーカイブする場合は対応済みを解除
        ...(newArchived ? { is_done: false, done_at: null } : {}),
      };
    } else if (action === "update_amount") {
      if (amount === undefined || amount === null) {
        return NextResponse.json({ error: "金額が必要です" }, { status: 400 });
      }
      updateData = { amount };
    } else {
      return NextResponse.json({ error: "不正なアクションです" }, { status: 400 });
    }

    const { data: updated, error } = await supabaseAdmin
      .from("documents")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("is_done, done_at, is_archived, archived_at, amount")
      .single();

    if (error) {
      console.error("Document PATCH error:", error);
      return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Documents PATCH error:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

// DELETE: Delete a document
export async function DELETE(req: NextRequest) {
  try {
    const supabaseClient = getUser(req);
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "IDが必要です" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("documents")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Document DELETE error:", error);
      return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Documents DELETE error:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
