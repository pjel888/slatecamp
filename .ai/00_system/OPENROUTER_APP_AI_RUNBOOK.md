# OPENROUTER_APP_AI_RUNBOOK

**Status:** Current after 2026-05-09 provider-boundary pivot.
**Scope:** SlateCamp app/runtime AI for learners and product users: tutor, Socratic, study-agent, embeddings, question generation, teach-back, and maintenance scripts that intentionally use the shared app AI provider layer.
**Not scope:** Developer-agent defaults. Developer AI is Codex-first with GPT-5.5 where available; do not force Hermes or local developer agents through OpenRouter.

## Decision

OpenRouter is the preferred app/runtime AI provider for learner-facing and user-facing AI when SlateCamp intentionally enables those features.

OpenRouter is not the default developer-agent provider. Developer AI should use Codex as the primary builder/model lane, with GPT-5.5 where available. OpenRouter should not be required for development workflows, local repo automation, or agent delegation.

| Boundary | Current stance | Key location | Notes |
|---|---|---|---|
| Developer AI | Codex-first; GPT-5.5 where available | Codex CLI auth/config; Hermes `model.provider=openai-codex` when Hermes is used | Use Codex for implementation and PR-ready diffs. OpenCode/Command Code/Kimi remain separate optional worker lanes. |
| Learner/user app AI | OpenRouter-preferred when product AI is intentionally enabled | App server env such as `.env.local` or deployment env | `/api/ai/*`, teach-back, question generation, embeddings, and maintenance AI scripts use `src/lib/ai/provider.ts`. |

Never expose OpenRouter credentials through `NEXT_PUBLIC_*`.

## Current implementation

- `src/lib/ai/provider.ts` supports `AI_PROVIDER=openrouter`, direct `openai`, and direct `anthropic` fallback modes.
- `src/lib/actions/teach-back.ts`, `scripts/normalize-distractors.ts`, and `scripts/sanitize-article-refs.ts` route through the shared provider abstraction instead of direct provider SDK usage.
- `src/lib/ai/provider.test.ts` covers OpenRouter chat, embeddings, streaming, missing-key behavior, and legacy OpenAI/Anthropic fallback compatibility.
- Direct short-prompt OpenRouter API validation returned `OPENROUTER_DIRECT_SHORT_OK` via curl during this PR pass.
- Current launch documentation may still keep live learner AI deferred until the product owner explicitly enables it with server-side env, privacy review, rate limits, and cost caps.

## App/runtime configuration

Use server-only app env, never client-exposed env:

```bash
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=<server-side-product-openrouter-key>
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_CHAT_MODEL=openai/gpt-4o
OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small
OPENROUTER_HTTP_REFERER=https://slatecamp.ph
OPENROUTER_APP_TITLE=SlateCamp
```

Notes:

- Keep the app/runtime key in `.env.local`, deployment env, or the hosting provider secret store.
- Do not put app/runtime OpenRouter keys in `.hermes/.env` for normal developer-agent use.
- Keep embeddings at `openai/text-embedding-3-small` unless the existing 1536-dimensional embedding index is intentionally rebuilt.
- OpenRouter routes requests to upstream model providers; review data controls before sending student data, uploaded files, long answer text, or private logs.

## Developer AI policy

Developer AI is Codex-first:

```bash
hermes config set model.provider openai-codex
hermes config set model.default gpt-5.5
hermes config set model.api_mode responses
hermes config set model.max_tokens 4096
hermes config set delegation.provider openai-codex
hermes config set delegation.model gpt-5.5
```

Use OpenRouter for app AI validation, not as the required Hermes/developer-agent provider. If a developer intentionally wants a one-off OpenRouter experiment, keep it explicit and separate from SlateCamp defaults.

## Privacy and source-control rules

- Never commit OpenRouter keys, `.env.local`, deployment secret exports, `.hermes/.env`, `~/.codex/auth.json`, or OAuth/session files.
- Do not use `NEXT_PUBLIC_OPENROUTER_API_KEY` or any other client-exposed OpenRouter secret.
- Do not send Supabase service-role keys, private env values, production data rows, student PII, or proprietary source drops through app AI prompts unless the product data boundary has been approved.
- Prefer redacted excerpts and bounded request payloads over raw database exports.

## Remaining risks / notes

| Risk | Status | Mitigation |
|---|---|---|
| Product OpenRouter key leaks to client | Open | Keep key server-only; scan for `NEXT_PUBLIC_OPENROUTER`; block committed `.env.local`. |
| Learner AI privacy/cost/rate-limit gaps | Deferred until AI launch | Add rate limits, cost caps, staging smoke tests, provider data-control review, and UX copy review before public enablement. |
| Embedding dimensionality drift | Deferred | Keep `OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small` unless re-indexing existing 1536-dimensional embeddings. |
| Developer/app provider confusion | Mitigated by this pivot | Codex/GPT-5.5 is the developer default; OpenRouter belongs to app/runtime AI for learners/users. |

## Verification checklist

- [x] App provider abstraction supports OpenRouter.
- [x] Provider tests cover OpenRouter chat, embedding, and streaming paths.
- [x] Direct short-prompt OpenRouter API check passed via curl.
- [x] No OpenRouter secret is committed or exposed as `NEXT_PUBLIC_*`.
- [x] Developer AI docs/config no longer force OpenRouter as the default.
- [ ] Public learner AI remains gated until a future AI launch decision explicitly enables it.
