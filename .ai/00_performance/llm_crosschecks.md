# LLM Crosschecks

This file records external/non-primary model assistance used during the performance audit. Codex remains responsible for validating all suggestions against code and measurements.

## Codex native subagents
Native Codex subagents were used for read-only parallel analysis, not as external authority. Their findings were accepted only when tied to inspected paths and later folded into reports as hypotheses or evidence-backed static findings.

| Lane | Prompt summary | Output status | Accepted? | Validation notes |
| --- | --- | --- | --- | --- |
| Frontend/routes | Inspect `src/app`, `e2e`, Playwright config, route docs for frontend performance inventory. | Completed. | Yes, selectively. | Route counts were treated as potentially drifting and cross-checked with generated inventory. Access and flow notes cite concrete files. |
| API/backend | Inspect route handlers, actions, queries, middleware, server data-loading patterns. | Completed. | Yes, selectively. | Endpoint and hot-path notes are included in API/backend and bottleneck reports as static findings unless measured. |
| Component/hotspots | Inspect React/components/features/hooks/stores for hotspot patterns. | Completed. | Yes, selectively. | Static hotspot risks are not treated as measured runtime bottlenecks until profiled. |
| Supabase/database | Inspect Supabase/database usage. | Completed. | Yes, selectively. | Static findings are incorporated into the Supabase/database and bottleneck reports, with live latency still blocked until safe credentials/fixtures exist. |

## Kimi / Gemini
No Kimi or Gemini crosscheck has been accepted yet. If invoked, this section will record the exact prompt, output path, suggestions, and acceptance decision.

## 2026-04-27 remediation-loop native subagent cross-checks

No Kimi or Gemini call was made in this loop. Native Codex subagents were used for bounded read-only cross-checks and their advice was validated against code and measurements before acceptance.

| Agent | Prompt focus | Main suggestion | Accepted? | Validation/evidence |
| --- | --- | --- | --- | --- |
| Sartre | Dashboard duplicate backend/data work | Replace full dashboard client sync with compact analytics sync payload. | Yes | Implemented in `src/components/dashboard/DashboardAnalyticsSync.tsx` and `src/lib/actions/dashboard-page.ts`; targeted dashboard test, typecheck, lint, and frontend comparison were run. |
| Goodall | 3D Lab bundle/config loading | Avoid broad 3D component barrel imports; split listing imports from viewer/viewport code. | Partially | Direct route/component imports landed and client-reference manifest bytes dropped for `/dashboard/3d-lab`; full registry metadata split remains open. |
| Mencius | Supabase broad reads | Prioritize high-traffic explicit columns and bounded session-history interactions. | Yes | `select('*')` candidates dropped from 19 to 9; changes documented in `21_supabase_query_tightening.md`. |
| Peirce | Admin/editor heavy lists | Do not edit admin list behavior without safe fixture; document fixtures and static hotspots first. | Yes | `23_admin_editor_remediation.md` documents blocked state and next measurement plan. |
| Singer | API provider timeout and cron scaling | Add provider fetch timeouts; fix focus-review queue timestamp mismatch; avoid destructive cron runs. | Yes | `src/lib/ai/provider.ts` timeout wrappers added; `focus_review_queues.generated_at` fixed; typecheck passed. |
