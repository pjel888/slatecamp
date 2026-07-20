import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";
import { questionGenerationPrompt } from "@/lib/ai/prompts";
import { isDemoMode } from "@/lib/demo/config";
import { checkRateLimit } from "@/lib/rate-limit";
import { parseAiBody } from "@/lib/ai/route-validation";

const GenerateQuestionsRequestSchema = z.object({
  chunkContent: z.string().min(1).max(20_000),
  profession: z.string().min(1).max(200),
  examTarget: z.string().min(1).max(200),
  difficulty: z.string().max(50).optional().default("medium"),
  count: z.number().int().min(1).max(20).optional().default(5),
})

export async function POST(request: Request) {
  if (isDemoMode()) {
    const parsed = await parseAiBody(
      request,
      z.object({ count: z.number().int().min(1).max(20).optional().default(5) }),
    )
    if (parsed.ok === false) return parsed.response
    const { count } = parsed.data
    const questions = Array.from({ length: count }, (_, i) => ({
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

  const rateLimit = await checkRateLimit(`ai_${user.id}`)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait before sending another message.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    )
  }

  const parsed = await parseAiBody(request, GenerateQuestionsRequestSchema)
  if (parsed.ok === false) return parsed.response
  const { chunkContent, profession, examTarget, difficulty, count } = parsed.data

  const ai = getAIProvider();
  const prompt = questionGenerationPrompt(
    profession,
    examTarget,
    chunkContent,
    count,
    difficulty,
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
