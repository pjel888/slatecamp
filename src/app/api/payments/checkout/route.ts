import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckout } from "@/lib/payments/provider";
import { isDemoMode } from "@/lib/demo/config";

export async function POST(request: Request) {
  if (isDemoMode()) {
    const origin = request.headers.get("origin") ?? "http://localhost:3000";
    return NextResponse.json({
      url: `${origin}/dashboard/settings/billing?success=true`,
      id: "demo-checkout",
      provider: "demo",
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tier } = await request.json();

  if (tier === "free") {
    return NextResponse.json({ error: "Cannot checkout for free tier" }, { status: 400 });
  }

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

  try {
    const result = await createCheckout({
      userId: user.id,
      email: user.email!,
      tier,
      successUrl: `${origin}/dashboard/settings/billing?success=true`,
      cancelUrl: `${origin}/dashboard/settings/billing?cancelled=true`,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Checkout creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
