import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Anthropic } from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    // 1. Check tokens in user_subscriptions (v1.0 simplification)
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .single();

    // Logic for token limits based on tier...
    // For now, allow all but log usage

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{ role: "user", content: message }],
      system: `You are the SlateCamp AI Tutor. Context: ${JSON.stringify(context)}`,
    });

    // 2. Log interaction in a hypothetical ai_interactions table or user_interactions
    // (Phase 5 will formalize this)

    return NextResponse.json({ reply: response.content[0] });
  } catch (error) {
    console.error("AI Tutor Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
