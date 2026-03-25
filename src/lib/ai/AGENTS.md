<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# ai

AI provider abstraction and prompt templates. Supports Anthropic Claude and OpenAI.

## Purpose

Centralized AI integration. Provider pattern allows swapping between Anthropic (primary, Temperature 0.0 for tutoring) and OpenAI. Prompt templates for question generation and Socratic tutoring.

## Key Files

| File | Description |
|------|-------------|
| `prompts.ts` | `questionGenerationPrompt()` — exam question writer with 4-choice format, difficulty, tags. `socraticTutorSystemPrompt()` — Temperature 0.0 Socratic tutor (Anthropic only) with RAG context + weak domain hints. |
| `provider.ts` | `AIProvider` interface (generateCompletion, generateEmbedding, streamCompletion). `OpenAIProvider` + `AnthropicProvider` implementations. `getAIProvider()` resolves from `AI_PROVIDER` env var. |

## For AI Agents

### Working In This Directory

- Provider pattern: Implement `AIProvider` interface for new providers.
- Prompts are functions returning prompt strings; kept separate from provider.
- Temperature: Question generation 0.7 (creative), tutoring 0.0 (deterministic).
- Anthropic: Primary for tutoring (mandated Temperature 0.0, citation badges in response).

### Adding a New Prompt

1. Create function in `prompts.ts`: `export function myPrompt(...): string`.
2. Accept context params (profession, discipline, content, etc.).
3. Return template string with injected values.
4. Include system prompt instruction if tutoring/guardrails needed.

### Common Patterns

- **System prompts**: Only in tutoring (0.0 temperature). Used in `generateCompletion(..., { systemPrompt })`.
- **RAG context**: Injected into socratic prompts via `ragContext` param.
- **JSON responses**: Question generator expects JSON array; client parses.
- **Streaming**: Used for chat/tutor responses; client handles token arrival.

## Dependencies

### Internal

- None (prompts are static template generators).

### External

- Anthropic API (claude-sonnet-4-20250514).
- OpenAI API (gpt-4o, text-embedding-3-small).
- Environment: `AI_PROVIDER`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`.

<!-- MANUAL: -->
