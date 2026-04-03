'use server'

import { getAIProvider } from '@/lib/ai/provider'
import { isDemoMode } from '@/lib/demo/config'

// ---------------------------------------------------------------------------
// Generate a culturally-relevant mnemonic for a fact the student keeps missing
// Called when a student fails the same recall-tier question 2+ times
// ---------------------------------------------------------------------------

const DEMO_MNEMONICS: Record<string, string> = {
  default:
    'Think "BAHAY" — B for Beam depth, A for Area load, H for Height limit, A for Allowable stress, Y for Yield strength.',
}

const SYSTEM_PROMPT = `You are a mnemonic generator for Filipino architecture Licensure Exam students.

TASK: Create ONE memorable mnemonic device for the given fact/concept.

RULES:
- Use Filipino cultural references when possible (local foods, landmarks, common phrases, Tagalog wordplay).
- Keep it under 20 words.
- Make it phonetically sticky — rhythm, rhyme, alliteration, or acronyms all work.
- Do NOT explain the mnemonic. Just output the mnemonic text, nothing else.
- The mnemonic must encode the key information so recalling it triggers the correct answer.`

export const generateMnemonic = async (
  factToRemember: string,
  topicName: string,
): Promise<string> => {
  if (isDemoMode()) {
    return DEMO_MNEMONICS.default
  }

  const ai = getAIProvider()

  try {
    const prompt = `Topic: ${topicName}\nFact to remember: ${factToRemember}\n\nGenerate a mnemonic:`

    const mnemonic = await ai.generateCompletion(prompt, {
      systemPrompt: SYSTEM_PROMPT,
      maxTokens: 80,
      temperature: 0,
    })

    return mnemonic.trim()
  } catch (error) {
    console.error('Mnemonic generation error:', error)
    return 'Try creating your own acronym from the key terms — it sticks better when you make it yourself.'
  }
}

