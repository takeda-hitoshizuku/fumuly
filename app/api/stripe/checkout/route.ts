import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getStripe, isPremiumUser } from "@/lib/stripe";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// サーバーサイドで許可されたプランのみ受け付ける
const PLAN_TO_PRICE: Record<string, string | undefined> = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID,
  yearly: process.env.STRIPE_YEARLY_PRICE_ID,
};

export async function POST(req: NextRequest) {
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

    const { plan } = await req.json();
    const priceId = PLAN_TO_PRICE[plan];

    if (!priceId) {
      return NextResponse.json(
        { error: "無効なプランです" },
        { status: 400 }
      );
    }

    // Get profile and check if already premium
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id, plan, is_vip")
      .eq("id", user.id)
      .single();

    if (profile && isPremiumUser(profile)) {
      return NextResponse.json(
        { error: "既に有料プランをご利用中です" },
        { status: 400 }
      );
    }

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);

      if (updateError) {
        console.error("Failed to save stripe_customer_id:", updateError);
        return NextResponse.json(
          { error: "顧客情報の保存に失敗しました" },
          { status: 500 }
        );
      }
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || "https://fumuly.com";

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/settings?upgraded=true`,
      cancel_url: `${origin}/upgrade`,
      metadata: { supabase_user_id: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "決済セッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
