import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";
import { isDemoMode } from "@/lib/demo/config";
import { checkRateLimit } from "@/lib/rate-limit";
import { parseAiBody } from "@/lib/ai/route-validation";

const EmbedRequestSchema = z.object({
  text: z.string().min(1).max(8000),
})

export async function POST(request: Request) {
  if (isDemoMode()) {
    const embedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
    return NextResponse.json({ embedding });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(`ai_${user.id}`)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait before sending another message.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    )
  }

  const parsed = await parseAiBody(request, EmbedRequestSchema)
  if (parsed.ok === false) return parsed.response
  const { text } = parsed.data

  try {
    const ai = getAIProvider();
    const embedding = await ai.generateEmbedding(text);
    return NextResponse.json({ embedding });
  } catch {
    return NextResponse.json(
      { error: "Embedding generation failed" },
      { status: 500 }
    );
  }
}
