import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getAuthClient(req: NextRequest) {
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

// GET: ユーザーのリマインダー一覧
export async function GET(req: NextRequest) {
  try {
    const supabaseClient = getAuthClient(req);
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode"); // "upcoming" | "all"
    const documentId = searchParams.get("document_id");

    let query = supabaseAdmin
      .from("reminders")
      .select(`
        id, document_id, remind_at, type, is_sent, created_at,
        documents!inner(sender, type, summary, deadline, category)
      `)
      .eq("user_id", user.id);

    // 特定書類のリマインダーのみ取得
    if (documentId) {
      query = query.eq("document_id", documentId);
    }

    if (mode === "upcoming") {
      // 未送信かつ未来のリマインダーのみ
      query = query
        .eq("is_sent", false)
        .gte("remind_at", new Date().toISOString())
        .order("remind_at", { ascending: true })
        .limit(10);
    } else {
      query = query
        .order("remind_at", { ascending: true });
    }

    const { data, error } = await query;
    if (error) {
      console.error("Reminders GET error:", error);
      return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Reminders GET error:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

// POST: リマインダー作成
export async function POST(req: NextRequest) {
  try {
    const supabaseClient = getAuthClient(req);
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await req.json();
    const { document_id, remind_at, type } = body;

    if (!document_id || !remind_at) {
      return NextResponse.json({ error: "書類IDとリマインド日時は必須です" }, { status: 400 });
    }

    // UUID形式バリデーション
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(document_id)) {
      return NextResponse.json({ error: "不正な書類IDです" }, { status: 400 });
    }

    const validTypes = ["in_app", "push", "calendar"];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json({ error: "不正なリマインダー種別です" }, { status: 400 });
    }

    // リマインド日時のバリデーション
    const remindDate = new Date(remind_at);
    if (isNaN(remindDate.getTime())) {
      return NextResponse.json({ error: "不正な日時です" }, { status: 400 });
    }

    // 書類の所有権確認
    const { data: doc } = await supabaseAdmin
      .from("documents")
      .select("id")
      .eq("id", document_id)
      .eq("user_id", user.id)
      .single();

    if (!doc) {
      return NextResponse.json({ error: "書類が見つかりません" }, { status: 404 });
    }

    // 同一書類に対する重複リマインダーチェック（同日同タイプ）
    const { data: existing } = await supabaseAdmin
      .from("reminders")
      .select("id")
      .eq("user_id", user.id)
      .eq("document_id", document_id)
      .eq("remind_at", remindDate.toISOString())
      .single();

    if (existing) {
      return NextResponse.json({ error: "同じ日時のリマインダーが既にあります" }, { status: 409 });
    }

    // ユーザーあたりのリマインダー上限チェック（最大50件）
    const { count } = await supabaseAdmin
      .from("reminders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_sent", false);

    if (count !== null && count >= 50) {
      return NextResponse.json({ error: "リマインダーの上限（50件）に達しています" }, { status: 429 });
    }

    const { data: reminder, error } = await supabaseAdmin
      .from("reminders")
      .insert({
        user_id: user.id,
        document_id,
        remind_at: remindDate.toISOString(),
        type: type || "in_app",
      })
      .select("id, document_id, remind_at, type, is_sent, created_at")
      .single();

    if (error) {
      console.error("Reminders POST error:", error);
      return NextResponse.json({ error: "作成に失敗しました" }, { status: 500 });
    }

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error("Reminders POST error:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

// DELETE: リマインダー削除
export async function DELETE(req: NextRequest) {
  try {
    const supabaseClient = getAuthClient(req);
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "IDが必要です" }, { status: 400 });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: "不正なIDです" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("reminders")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id");

    if (error) {
      console.error("Reminders DELETE error:", error);
      return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "リマインダーが見つかりません" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reminders DELETE error:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
