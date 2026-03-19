import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";
import { questionGenerationPrompt } from "@/lib/ai/prompts";
import { isDemoMode } from "@/lib/demo/config";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (isDemoMode()) {
    const { count } = await request.json();
    const questions = Array.from({ length: count ?? 5 }, (_, i) => ({
      prompt: `Demo question ${i + 1}: What is the primary structural function of a shear wall in a building?`,
      choices: [
        { id: "a", text: "Resist lateral forces", is_correct: true },
        { id: "b", text: "Support vertical loads only", is_correct: false },
        { id: "c", text: "Provide thermal insulation", is_correct: false },
        { id: "d", text: "Distribute plumbing loads", is_correct: false },
      ],
      correct_answer: "a",
      explanation: "Shear walls resist lateral forces (wind, seismic) by transferring them to the foundation.",
      difficulty: "medium",
      tags: ["structural", "demo"],
    }));
    return NextResponse.json({ questions });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit(`ai_${user.id}`)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait before sending another message.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    )
  }

  const { chunkContent, profession, examTarget, difficulty, count } =
    await request.json();

  const ai = getAIProvider();
  const prompt = questionGenerationPrompt(
    profession,
    examTarget,
    chunkContent,
    count ?? 5,
    difficulty ?? "medium"
  );

  try {
    const response = await ai.generateCompletion(prompt, {
      maxTokens: 4096,
      temperature: 0.7,
    });

    const questions = JSON.parse(response);
    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json(
      { error: "Question generation failed" },
      { status: 500 }
    );
  }
}
