import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";
import { checkRateLimit } from "@/lib/rate-limit";
import { parseAiBody } from "@/lib/ai/route-validation";

// `context` is client-supplied quiz state that gets stringified into the
// generator prompt. We accept any JSON shape (the tutor formats it for the
// model) but cap its serialized size to bound prompt-injection blast radius.
const TutorRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  context: z.unknown().optional(),
})

export async function POST(req: Request) {
  try {
    const parsed = await parseAiBody(req, TutorRequestSchema)
    if (parsed.ok === false) return parsed.response
    const { message, context: quizContext } = parsed.data

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const rateLimit = await checkRateLimit(`ai_tutor_${user.id}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before sending another message.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
      );
    }

    const ai = getAIProvider();

    // 1. Generate embedding for the user's query
    const queryEmbedding = await ai.generateEmbedding(message);

    // 2. Search for relevant wiki articles (RAG)
    const { data: wikiMatches, error: matchError } = await supabase.rpc('match_wiki_articles', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 3,
    });

    if (matchError) {
      console.error("Wiki match error:", matchError);
    }

    const contextChunks = wikiMatches?.map((m: any) => 
      `TITLE: ${m.title}\nSLUG: ${m.slug}\nCONTENT: ${m.content}`
    ).join("\n\n---\n\n") || "No specific wiki articles found for this query.";

    // 3. PASS 1: Generator
    const generatorPrompt = `You are the SlateCamp AI Tutor. Answer the student's question based STRICTLY on the provided context.
If the answer is not in the context, say "I don't have enough verified information in our database to answer that specifically, but based on general principles..."

Retrieved Wiki Context:
${contextChunks}

Quiz Context:
${JSON.stringify(quizContext, null, 2)}

User Question:
${message}

Rules:
- Append source tags in the format [Source: slug] for every factual claim.
- Be direct, professional, and educational.
- Under 200 words.`;

    const generatedResponse = await ai.generateCompletion(generatorPrompt, {
      temperature: 0,
      maxTokens: 512,
    });

    // 4. PASS 2: Auditor (Double-Pass Verification)
    const auditorPrompt = `You are a Fact Auditor for SlateCamp. Your job is to verify that the following AI-generated response is supported by the retrieved context.

Retrieved Context:
${contextChunks}

AI-Generated Response:
${generatedResponse}

Rules:
- If the response makes claims NOT supported by the context, flag them.
- If the response is largely unsupported, output "REJECTED".
- If the response is accurate to the context, output "APPROVED: " followed by the original response.
- Do NOT add your own information.

Final Output:`;

    const auditedOutput = await ai.generateCompletion(auditorPrompt, {
      temperature: 0,
      maxTokens: 600,
    });

    let finalReply = generatedResponse;
    if (auditedOutput.startsWith("REJECTED")) {
      finalReply = "I'm sorry, I couldn't find enough verified evidence in our official database to provide a precise answer. Please refer to the core principles in the Wiki.";
    } else if (auditedOutput.startsWith("APPROVED: ")) {
      finalReply = auditedOutput.replace("APPROVED: ", "");
    }

    // 5. Log interaction (Phase 5 placeholder)
    
    return NextResponse.json({ reply: finalReply });
  } catch (error) {
    console.error("AI Tutor Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
