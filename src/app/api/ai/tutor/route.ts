import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Anthropic } from "@anthropic-ai/sdk";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const rateLimit = checkRateLimit(`ai_${user.id}`)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before sending another message.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
      )
    }

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
      max_tokens: 512,
      temperature: 0,
      messages: [{ role: "user", content: message }],
      system: `You are the SlateCamp AI Tutor — a direct, expert educator for professional licensure exams.

Question context:
${JSON.stringify(context, null, 2)}

Respond EXACTLY in this format (no extra text):
**Misconception:** [2-3 sentences on the most common wrong reasoning for this type of question]
**Principle:** [2-3 sentences on the core concept being tested and why the correct answer is right]
**Wiki Reference:** [single topic name from the discipline wiki that covers this concept]

Rules:
- Be direct and educational, not reassuring
- Under 200 words total
- No filler phrases like "Great question!" or "Don't worry"
- If student answered correctly, the Misconception section should explain what the distractor options were testing`,
    });

    // 2. Log interaction in a hypothetical ai_interactions table or user_interactions
    // (Phase 5 will formalize this)

    return NextResponse.json({ reply: response.content[0] });
  } catch (error) {
    console.error("AI Tutor Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
