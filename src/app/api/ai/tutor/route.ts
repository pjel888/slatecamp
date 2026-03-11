import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";
import { getFeatureFlags, hasTierAccess } from "@/lib/admin/feature-flags";
import { isAdminByEmail } from "@/lib/admin/is-admin";
import { isDemoMode } from "@/lib/demo/config";

const DEMO_RESPONSES = [
  "That's a great question! Let me ask you this — when you think about load paths in a building, where does the force from the roof ultimately need to end up?",
  "Interesting thought. Consider this: what happens to a beam when the span increases but the depth stays the same? Think about the relationship between span and deflection.",
  "You're on the right track! Now, what's the key difference between how a truss transfers loads versus a solid beam? Think about the role of triangulation.",
  "Good observation. Let me push your thinking further — why would an architect choose a post-tensioned slab over a conventional one for a parking structure with long spans?",
  "You're getting closer! Think about it this way: if concrete is strong in compression but weak in tension, what does the steel tendon do to help the concrete work more efficiently?",
  "Excellent reasoning! You've identified the core principle. In the context of the ALE exam, remember that structural efficiency is about matching the structural system to the loading condition and span requirements.",
];

export async function POST(request: Request) {
  if (isDemoMode()) {
    const { messages } = await request.json();
    const idx = (messages?.length ?? 0) % DEMO_RESPONSES.length;
    return NextResponse.json({ message: DEMO_RESPONSES[idx] });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier, ai_tokens_used, ai_tokens_limit")
    .eq("id", user.id)
    .single();

  const flags = await getFeatureFlags();
  const isAdmin = (profile as { is_admin?: boolean } | null)?.is_admin === true || await isAdminByEmail(user.email ?? undefined);
  const canAccessTutor =
    flags.bypassAiGate ||
    hasTierAccess("max", profile?.tier ?? "free", isAdmin, flags);

  if (!canAccessTutor) {
    return NextResponse.json(
      { error: "Socratic Tutor requires Max plan" },
      { status: 403 }
    );
  }

  const { messages } = await request.json();
  const ai = getAIProvider();

  const systemPrompt = `You are a Socratic tutor for architecture board exam preparation. The student is studying for their board exam.

RULES:
1. NEVER give the answer directly.
2. Ask ONE guiding question at a time.
3. Build on what the student already knows.
4. Use analogies relevant to architecture.
5. If the student is stuck after 3 exchanges, provide a hint, not the answer.
6. Keep responses concise (2-3 sentences max).
7. Celebrate when they arrive at the correct understanding.`;

  const lastMessage = messages[messages.length - 1]?.content ?? "";

  try {
    const response = await ai.generateCompletion(lastMessage, {
      systemPrompt,
      maxTokens: 500,
      temperature: 0.7,
    });

    await supabase
      .from("profiles")
      .update({
        ai_tokens_used: (profile?.ai_tokens_used ?? 0) + 100,
      })
      .eq("id", user.id);

    return NextResponse.json({ message: response });
  } catch {
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}
