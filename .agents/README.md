# `.agents`

## Why this exists

`.agents/skills/` is the repo-shared Codex skill surface for SlateCamp.

It exists so future Codex sessions can load a small, reusable workflow instruction set without re-deriving the same repo-specific audit/setup rules from scratch every time.

## Relationship to `.ai`

- `.ai` is the canonical documentation, audit, plan, and governance layer
- `.agents/skills` is the reusable Codex workflow layer
- skills should point back to canonical `.ai` docs, not replace them

## Read first

- `.ai/00_system/CODEX_ENABLEMENT_GUIDE.md`
- `.ai/00_system/DOCS_SOURCE_OF_TRUTH.md`
- `.ai/00_system/CODEX_SKILLS_MAP.md`
