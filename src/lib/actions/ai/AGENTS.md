<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# ai

## Purpose

AI tutor and mnemonic generation server actions. Provides context-aware AI completions for educational purposes, including mnemonic generation for frequently missed facts.

## Key Files

| File | Description |
|------|-------------|
| **generate-mnemonic.ts** | Generate culturally-relevant mnemonics for missed facts using AI: encodes key information, uses Filipino cultural references (foods, landmarks, Tagalog wordplay), phonetically sticky (rhythm, rhyme, alliteration) |

## For AI Agents

### Working In This Directory

1. **Use `'use server'`** on all action files.
2. **Temperature = 0.0** — all AI completions use deterministic generation (no randomness) for reproducible mnemonics.
3. **Demo mode fallback** — check `isDemoMode()` before calling AI provider; return static demo mnemonic if in demo.
4. **Max tokens limiting** — set `maxTokens: 80` to keep mnemonics short (< 20 words).
5. **Error graceful** — if AI provider fails, return a helpful text string (e.g., "Try creating your own acronym...") rather than throwing.
6. **Cultural context** — for Filipino board exams, weave in local references: foods (adobo, lumpia), landmarks (Intramuros, Pagsanjan Falls), Tagalog wordplay, common phrases.

### Common Patterns

**Mnemonic generation with demo mode and error handling:**
```typescript
'use server'

import { getAIProvider } from '@/lib/ai/provider'
import { isDemoMode } from '@/lib/demo/config'

const DEMO_MNEMONICS: Record<string, string> = {
  default: 'Think "BAHAY" — B for Beam depth, A for Area load, H for Height limit...',
}

const SYSTEM_PROMPT = `You are a mnemonic generator for Filipino architecture board exam students.

TASK: Create ONE memorable mnemonic device for the given fact/concept.

RULES:
- Use Filipino cultural references when possible (local foods, landmarks, Tagalog wordplay).
- Keep it under 20 words.
- Make it phonetically sticky — rhythm, rhyme, alliteration, or acronyms.
- Do NOT explain the mnemonic. Just output the mnemonic text, nothing else.`

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
      temperature: 0,  // Deterministic
    })

    return mnemonic.trim()
  } catch (error) {
    console.error('Mnemonic generation error:', error)
    // Return helpful fallback text rather than crashing
    return 'Try creating your own acronym from the key terms — it sticks better when you make it yourself.'
  }
}
```

## Dependencies

### Internal

- `@/lib/ai/provider` — getAIProvider
- `@/lib/demo/config` — isDemoMode

### External

- AI provider SDK (OpenAI, Anthropic, or Vercel AI SDK depending on implementation)
