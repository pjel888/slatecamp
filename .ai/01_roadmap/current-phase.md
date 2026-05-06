# Current Phase

**Last Updated:** 2026-05-05
**Source:** `.ai/10_state/current-state.md` and `.ai/02_audits/SUPABASE_VERIFICATION_TARGET_MIGRATION_REPLAY_TYPE_REGENERATION_REPORT_2026_05_05.md`

## Active phase

**Supabase verification and release governance**

SlateCamp is in pre-launch MVP hardening. The current objective is not scope expansion. The current objective is to finish database release verification, preserve validated app behavior, and make the existing payment-free/live-AI-free app safe enough for beta and production review.

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
