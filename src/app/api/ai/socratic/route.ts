import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAIProvider } from '@/lib/ai/provider'
import { isDemoMode } from '@/lib/demo/config'
import { checkRateLimit } from '@/lib/rate-limit'
import { parseAiBody } from '@/lib/ai/route-validation'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SocraticResponse {
  message: string
  turnNumber: number
  isComplete: boolean
  sources: string[]
}

// `MAX_TURNS` is referenced by the schema below; declared first to avoid TDZ.
const MAX_TURNS = 5

// Runtime validation for the request body. The previous code cast the body
// to an ad-hoc interface without validation, then indexed
// `body.conversationHistory.length` — a malformed payload would have thrown
// at that access. Now it's validated upfront with bounded string lengths
// (every field flows into a model prompt, so length caps also bound cost).
const SocraticRequestSchema = z.object({
  questionText: z.string().min(1).max(8000),
  selectedAnswer: z.string().min(1).max(4000),
  correctAnswer: z.string().min(1).max(4000),
  topicName: z.string().max(500).optional().default(''),
  topicId: z.string().max(200).optional().default(''),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['assistant', 'user']),
        content: z.string().max(4000),
      }),
    )
    .max(MAX_TURNS + 2)
    .optional()
    .default([]),
})

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEMO_RESPONSES: string[] = [
  'That is a common misconception. Think about what happens when you apply this principle to a real structure. What factor determines the load distribution in this case? [Source: structural-analysis]',
  'You are getting closer. Consider the relationship between the material properties and the environmental conditions. How would moisture affect this scenario? [Source: building-materials]',
  'Good thinking. Now, if you apply that same logic to the building code requirements, what minimum dimension would you expect? [Source: building-codes-standards]',
  'Exactly. The key insight is that these two concepts are interconnected. When one changes, the other must compensate. Can you explain why that balance matters for occupant safety?',
  'You have shown solid reasoning through this exploration. The core principle here is that structural integrity and code compliance work together. I encourage you to try a similar question to reinforce this understanding. [Source: structural-analysis]',
]

// ---------------------------------------------------------------------------
// System prompt for Socratic exploration
// ---------------------------------------------------------------------------

const buildSystemPrompt = (
  questionText: string,
  selectedAnswer: string,
  correctAnswer: string,
  topicName: string,
) => `You are the SlateCamp Socratic Tutor — an expert educator who guides students to understanding through targeted questions.

CONTEXT:
- The student answered a question incorrectly during a practice session.
- Question: ${questionText}
- Student's answer: ${selectedAnswer}
- Correct answer: ${correctAnswer}
- Topic: ${topicName}

RULES (follow these exactly):
1. NEVER reveal the correct answer directly — the student already saw it in the feedback panel.
2. Ask exactly ONE guiding question per turn to lead the student toward understanding WHY the correct answer is right.
3. Reference specific concepts, code sections, dimensions, or principles relevant to the topic.
4. Keep each response under 120 words.
5. This conversation has a maximum of ${MAX_TURNS} exchanges.
6. On the final turn (turn ${MAX_TURNS}), summarize the key insight and encourage the student to try a similar question.
7. For any factual claim, append a source tag in the format [Source: wiki_slug] using the most relevant wiki article slug.
8. Use a warm, direct tone — no filler phrases, no excessive praise, no condescension.
9. If the student says "I understand now" or equivalent, acknowledge their understanding and end the conversation.
10. Frame errors as learning opportunities, not failures. Use growth language.

TONE: The "Confident Companion" — warm, supportive, growth-framed. No toxic positivity. No militaristic language.`

// ---------------------------------------------------------------------------
// Source extraction helper
// ---------------------------------------------------------------------------

const extractSources = (text: string): string[] => {
  const pattern = /\[Source:\s*([^\]]+)\]/g
  const slugs: string[] = []
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    const slug = match[1].trim()
    if (slug && !slugs.includes(slug)) {
      slugs.push(slug)
    }
  }
  return slugs
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export const POST = async (request: Request) => {
  // Demo mode — return canned responses
  if (isDemoMode()) {
    const parsed = await parseAiBody(request, SocraticRequestSchema)
    if (parsed.ok === false) return parsed.response
    const body = parsed.data
    const turnNumber = body.conversationHistory.length + 1
    const clampedTurn = Math.min(turnNumber, MAX_TURNS)
    const demoMessage = DEMO_RESPONSES[clampedTurn - 1] ?? DEMO_RESPONSES[DEMO_RESPONSES.length - 1]
    const sources = extractSources(demoMessage)

    return NextResponse.json<SocraticResponse>({
      message: demoMessage,
      turnNumber: clampedTurn,
      isComplete: clampedTurn >= MAX_TURNS,
      sources,
    })
  }

  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limiting
  const rateLimit = await checkRateLimit(`ai_socratic_${user.id}`)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait before sending another message.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } },
    )
  }

  // Parse and validate request
  const parsed = await parseAiBody(request, SocraticRequestSchema)
  if (parsed.ok === false) return parsed.response
  const body = parsed.data
  const { questionText, selectedAnswer, correctAnswer, topicName, conversationHistory } = body

  const turnNumber = conversationHistory.length + 1

  if (turnNumber > MAX_TURNS) {
    return NextResponse.json<SocraticResponse>({
      message: 'This exploration session is complete. Try a similar question to reinforce what you learned.',
      turnNumber: MAX_TURNS,
      isComplete: true,
      sources: [],
    })
  }

  // Build conversation for the AI
  const systemPrompt = buildSystemPrompt(questionText, selectedAnswer, correctAnswer, topicName)

  // Build a single prompt from conversation history
  const historyText = conversationHistory
    .map((msg) => `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`)
    .join('\n\n')

  const turnContext =
    turnNumber === MAX_TURNS
      ? `\n\n[This is the final turn (${turnNumber} of ${MAX_TURNS}). Summarize the key insight and encourage the student.]`
      : `\n\n[This is turn ${turnNumber} of ${MAX_TURNS}.]`

  const userPrompt = historyText
    ? `Conversation so far:\n\n${historyText}${turnContext}\n\nContinue the Socratic dialogue with ONE guiding question.`
    : `The student just got this question wrong and wants to understand why. Begin the Socratic exploration with ONE guiding question.${turnContext}`

  // Call AI provider
  const ai = getAIProvider()

  try {
    const responseText = await ai.generateCompletion(userPrompt, {
      systemPrompt,
      maxTokens: 300,
      temperature: 0,
    })

    const sources = extractSources(responseText)
    const isComplete =
      turnNumber >= MAX_TURNS ||
      responseText.toLowerCase().includes('try a similar question') ||
      responseText.toLowerCase().includes('exploration is complete')

    return NextResponse.json<SocraticResponse>({
      message: responseText,
      turnNumber,
      isComplete,
      sources,
    })
  } catch (error) {
    console.error('Socratic tutor error:', error)
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 })
  }
}
