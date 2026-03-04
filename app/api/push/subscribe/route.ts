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

// POST: Push Subscription を保存
export async function POST(req: NextRequest) {
  try {
    const supabaseClient = getAuthClient(req);
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await req.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "不正なSubscriptionデータです" }, { status: 400 });
    }

    // upsert: 同じendpointなら更新、なければ挿入
    const { error } = await supabaseAdmin
      .from("push_subscriptions")
      .upsert(
        {
          user_id: user.id,
          endpoint,
          keys_p256dh: keys.p256dh,
          keys_auth: keys.auth,
        },
        { onConflict: "user_id,endpoint" }
      );

    if (error) {
      console.error("Push subscribe error:", error);
      return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Push subscribe error:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

// DELETE: Push Subscription を削除
export async function DELETE(req: NextRequest) {
  try {
    const supabaseClient = getAuthClient(req);
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get("endpoint");

    if (!endpoint) {
      return NextResponse.json({ error: "endpointが必要です" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("endpoint", endpoint);

    if (error) {
      console.error("Push unsubscribe error:", error);
      return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push unsubscribe error:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
