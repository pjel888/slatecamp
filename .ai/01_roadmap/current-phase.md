# Current Phase

**Last Updated:** 2026-05-07
**Source:** `.ai/10_state/current-state.md`, `.ai/02_audits/SUPABASE_VERIFICATION_TARGET_MIGRATION_REPLAY_TYPE_REGENERATION_REPORT_2026_05_05.md`, `.ai/13_research/reddit-sentiment-landing-positioning-2026-05-07/sentiment-and-platform-positioning-report.md`, `.ai/13_research/filipino-consumer-brand-positioning-2026-05-07/brand-cue-and-exam-buyer-psychology-report.md`, `.ai/03_plans/2026-05-07-landing-page-platform-positioning-plan.md`, and `.ai/03_plans/2026-05-07-landing-page-final-messaging-gate.md`

## Active phase

**Supabase verification and release governance, with 2026-05-07 landing/platform positioning priority overlay**

SlateCamp remains in pre-launch MVP hardening. The technical launch blocker remains database release verification, preserving validated app behavior, and making the existing payment-free/live-AI-free app safe enough for beta and production review.

For today’s product/brand priority, SlateCamp is also actively revising landing-page positioning before implementation. The new strategic direction is to avoid coupling the whole brand too tightly to the LEA while also avoiding an overly local/directory-like first impression. LEA readiness remains the sharpest acquisition wedge, but the umbrella should feel like a premium architecture learning platform for college, board readiness, and professional practice. `Philippine` should be used as a scope/trust/SEO qualifier, not necessarily as the hero’s first emotional prestige cue.

Landing-page priority for 2026-05-07:

- Make the first two scrolls clearly explain the four pillars: Knowledge Resources, Quizzes, 3D Lab, and Free Tools.
- Keep `Get Your Free Readiness Score` as the LEA pathway CTA, not the entire product identity.
- Add broader CTAs and proof for `Explore Knowledge Resources` and `Open Free Tools`.
- Preserve review-center/school complementarity: SlateCamp supports instruction; it does not replace review centers, universities, PRC/PRBoA sources, or licensed professional judgment.
- Prepare for university partnership language by framing SlateCamp as a resource/diagnostic/interactive-lab platform.

Payment launch and live AI chatbot/provider launch are future roadmap items and must not be treated as blockers for the current launch cutline unless UI/docs claim they are live.

## Current milestone

- [ ] Restore/create a safe Supabase verification target.
- [ ] Add/restore `supabase/config.toml` for local Supabase workflow.
- [ ] Replay all 101 active migrations on a verified local/staging target.
- [ ] Verify AI audit access-control migration:
  - `supabase/migrations/20260505145349_restrict_ai_audit_admin_access.sql`
- [ ] Regenerate Supabase types from the verified schema:
  - `src/types/supabase.ts`
- [ ] Rerun the full validation gate after type regeneration.
- [ ] Verify production/staging deployment environment values without exposing secrets.
- [ ] Human-review broad `.ai`/docs diff before commit/release.

**Today’s landing/platform positioning overlay:**

- [ ] Rewrite landing-page plan around the four public pillars: Knowledge Resources, Quizzes, 3D Lab, and Free Tools.
- [ ] Keep LEA readiness as the highest-intent pathway without making SlateCamp LEA-only.
- [ ] Add university/educator-compatible positioning and legal-safe educational-resource boundaries.
- [ ] Make free tools and calculators visible as acquisition surfaces.
- [x] Finalize the brand-cue messaging gate before coding: hero, subheadline, local trust line, SEO title/meta, disclaimer, university section, and review-center companion section.
  - Gate artifact: `.ai/03_plans/2026-05-07-landing-page-final-messaging-gate.md`

## Completed remediation

- [x] Debug/test route removal:
  - `/debug-supabase`
  - `/debug-cache-bypass`
  - `/debug-check`
  - `/debug-mdx`
  - `/debug-mdx-detailed`
  - `/test-media`
- [x] Cron fail-closed auth through `src/lib/api/cron-auth.ts`.
- [x] `payrex-node` / vulnerable axios path removed from the active production dependency graph while payment remains deferred.
- [x] Production environment guardrails added for developer bypass variables.
- [x] Stale DB reference cleanup/quarantine completed for known stale objects.
- [x] Rollback SQL archived out of active migrations:
  - `.ai/09_archive/store/DB_ROLLBACKS/2026-05-05/rollback_lea_to_ale.sql`
- [x] Application validation gate passed after P0/stale-reference cleanup:
  - `git diff --check`
  - `bun run type-check`
  - `bun test src/`
  - `bun run test:dom`
  - `bun run lint`
  - `bun audit`
  - `bun run build`
  - `bun run check:entitlements`
  - `bun run test:e2e:prod`

## Active launch-blocker categories

### Must fix before production

- Provide a verified local/staging Supabase target.
- Restore/create `supabase/config.toml`.
- Replay/verify the 101 active migrations.
- DB-verify AI audit learner denial and `service_role`/admin success for sensitive AI audit views/RPC.
- Regenerate `src/types/supabase.ts` from the verified target schema.
- Confirm production environment variables are present and safe:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `CRON_SECRET` if cron routes are deployed
  - `NEXT_PUBLIC_APP_URL`
  - admin/owner bootstrap variables as needed
- Human-review the broad `.ai`/docs diff before commit/release.

### Should fix before beta

- Clean remaining lint warnings.
- Fix or explain the `--localstorage-file` build warning.
- Add CI/schema drift check for generated Supabase types.
- Run staging smoke tests for auth, dashboard, quiz, wiki, admin access denial, cron denial/allow cases, and AI audit admin access.
- Verify learner-facing APIs do not expose answer keys, `correct_option_id`, audit snippets, or content previews.

### Can fix after launch

- Schema squash/reset cleanup after production source-of-truth is stable.
- Broader `.ai` archive consolidation.
- README/static count refresh.
- Legacy payment schema/type residue cleanup.

### Future roadmap

- Payment provider launch.
- PayRex checkout/webhooks.
- Live AI chatbot/provider.
- OpenAI/Anthropic-backed tutoring.
- Paid checkout/webhook staging QA.
- AI provider-backed tutoring QA.

## Safety warning

The latest `bunx supabase migration list` reached an unclear remote/cached context. That context is not verified as staging/test. Do not apply migrations there and do not regenerate Supabase types from it.
