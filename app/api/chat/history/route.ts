import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { decrypt } from "@/lib/encryption";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const supabaseClient = createServerClient(
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
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const { data } = await supabaseAdmin
      .from("conversations")
      .select("id, role, content, created_at")
      .eq("user_id", user.id)
      .is("document_id", null)
      .order("created_at", { ascending: true })
      .limit(50);

    const messages = (data ?? []).map((m) => ({
      id: m.id,
      role: m.role,
      content: decrypt(m.content),
      created_at: m.created_at,
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Chat history error:", error);
    return NextResponse.json(
      { error: "履歴の取得に失敗しました" },
      { status: 500 }
    );
  }
}
