import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAIProvider } from '@/lib/ai/provider'
import { isDemoMode } from '@/lib/demo/config'
import { checkRateLimit } from '@/lib/rate-limit'
import { parseAiBody } from '@/lib/ai/route-validation'

export type StudyAgentAction = 'summarize' | 'flashcards' | 'code_check'

const StudyAgentRequestSchema = z.object({
  action: z.enum(['summarize', 'flashcards', 'code_check']),
  content: z.string().min(1).max(8000),
})

const DEMO_SUMMARIZE = `**Key points (atomic):**
- First main idea from your notes.
- Second main idea with supporting detail.
- Third takeaway.`;

const DEMO_FLASHCARDS = `**Suggested recall questions:**
1. What is the main purpose of [concept]?
2. How does [X] differ from [Y]?
3. What are the key dimensions/criteria for [topic]?
4. When would you use [approach A] vs [approach B]?
5. What does [rule/section] require?`;

const DEMO_CODE_CHECK = `**Code check:** Your note mentions building code concepts. For exam prep, verify exact dimensions (e.g. ceiling heights, occupancy classifications) against the official source (e.g. PD 1096, Rule 7, Rule 8) or your Wiki. This note does not replace the authoritative reference.`;

export async function POST(request: Request) {
  if (isDemoMode()) {
    const parsed = await parseAiBody(
      request,
      z.object({ action: z.enum(['summarize', 'flashcards', 'code_check']).optional() }),
    )
    if (parsed.ok === false) return parsed.response
    const { action } = parsed.data
    const text = action === 'summarize' ? DEMO_SUMMARIZE : action === 'flashcards' ? DEMO_FLASHCARDS : DEMO_CODE_CHECK
    return NextResponse.json({ text })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rateLimit = await checkRateLimit(`ai_${user.id}`)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait before sending another message.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    )
  }

  const parsed = await parseAiBody(request, StudyAgentRequestSchema)
  if (parsed.ok === false) return parsed.response
  const { action, content } = parsed.data

  const systemPrompts: Record<StudyAgentAction, string> = {
    summarize: `You are a Study Tutor for architecture Licensure Exam preparation. The user has pasted messy lecture or reading notes.

TASK: "Summarize & Atomicize"
- Turn the note into clear, scannable bullet points.
- Use **bold** for key terms and numbers.
- One idea per bullet. Keep each bullet concise (one line when possible).
- Preserve important dimensions, rule numbers, and definitions.
- Output valid markdown. Do not add a title; start with the first bullet.`,

    flashcards: `You are a Study Tutor for architecture Licensure Exam preparation. The user has pasted note content.

TASK: "Generate Flashcards"
- Scan the note and suggest exactly 5 active-recall questions that would make good flashcards for the Assessment/quiz module.
- Format as a numbered list. Each item is one question (front of card). Keep questions focused and answerable from the note.
- Do not include answers. Output format:
**Suggested recall questions:**
1. [Question one]
2. [Question two]
...`,

    code_check: `You are a Study Tutor for architecture Licensure Exam preparation. The user may have written about building codes, rules, or dimensions (e.g. PD 1096, Rule 7, Rule 8, ceiling heights, occupancy).

TASK: "Code Check"
- If the note mentions specific dimensions, rule numbers, or code concepts: briefly flag whether they match common reference values (e.g. 2.40m habitable ceiling, 2.10m non-habitable; Rule 7 occupancy groups A–J) and suggest verifying against the official Wiki or NBCP.
- If the note does not contain code-related content, say: "No code-specific content to verify. Add dimensions or rule references to get a check."
- Keep the response short (2–4 sentences). Do not reproduce full code text.`,
  }

  const systemPrompt = systemPrompts[action]
  const ai = getAIProvider()

  try {
    const text = await ai.generateCompletion(content, {
      systemPrompt,
      maxTokens: 1024,
      temperature: 0.4,
    })
    return NextResponse.json({ text: text ?? '' })
  } catch (e) {
    console.error('Study agent error:', e)
    return NextResponse.json(
      { error: 'AI request failed' },
      { status: 500 }
    )
  }
}

