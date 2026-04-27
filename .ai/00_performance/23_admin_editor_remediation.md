# 23 — Admin / Editor Heavy List Remediation

Generated: 2026-04-27T00:26:50Z

## Status
No admin/editor source code was changed in this loop. The safe fixture required to measure privileged admin/editor routes is still unavailable, and the most valuable admin remediation changes would alter list/search semantics. This phase therefore records the measured/static evidence, safe remediation design, and fixture requirements rather than making speculative UI/data-loading changes.

## Highest-confidence bottlenecks

| Location | Evidence | Risk |
| --- | --- | --- |
| `src/lib/actions/admin/content.ts:getContentEditorIndexData()` | Loads up to 500 article bodies, all taxonomy nodes, all article-taxonomy links, all question text/topic rows, then performs repeated JS `find`/`filter` transforms. | Large payloads and O(N²)-style transforms before the editor is usable. |
| `src/components/admin/unified-editor/ContentEditorIndex.tsx` | Client filters/searches all local articles and all searchable questions, then renders every filtered result. | Large DOM and search input latency when content grows. |
| `src/components/admin/unified-editor/QuestionsPanel.tsx` | Filters in multiple passes, groups by repeatedly filtering per linked node, and renders all filtered cards/drafts. | Re-render/reconciliation spikes with thousands of questions. |
| `src/components/shared/taxonomy-picker.tsx` and `src/components/shared/taxonomy-tree.tsx` | Recursive `findNode`/ancestor/filter paths are called repeatedly and there is no virtualization/windowing. | Search/expand-all can render or traverse the entire taxonomy. |

## Safe remediation plan
1. Extract pure admin editor transforms from `getContentEditorIndexData()` and benchmark them with synthetic data before changing UI behavior.
2. Replace repeated `find`/`filter` transforms with maps:
   - `childrenByParent`
   - `articlesById`
   - `linksByArticle`
   - `primaryLinkByArticle`
   - `articleIdsByNode`
3. Remove article `content` from index payload only after replacing exact word-count display with `read_time`, stored word count, or deferred detail fetch.
4. Add bounded rendering in `QuestionsPanel` using pagination / “show next 50/100” before adding a virtualization dependency.
5. Precompute `nodeById` / `parentById` maps in taxonomy picker/tree and limit expand-all behavior for large trees.

## Measurement plan without credentials
- Add a synthetic transform benchmark for `getContentEditorIndexData()` data shapes: 300/1,000/3,000 taxonomy nodes, 500 articles, 5k/20k questions.
- Add component/story fixtures for `ContentEditorIndex`, `QuestionsPanel`, `TaxonomyTree`, and `TaxonomyPicker` with synthetic props.
- Track initial render time, search input latency, expand-all latency, DOM node count, and React Profiler commit time.

## Privileged fixture blocker
Real route timing for `/admin/knowledge`, `/admin/knowledge/questions`, and question/article editors requires a safe admin role fixture. Required variable names only:

- `PLAYWRIGHT_ADMIN_EMAIL`
- `PLAYWRIGHT_ADMIN_PASSWORD`
- `ADMIN_EMAILS` or a seeded `user_roles` row in local/staging Supabase

## Why no speculative edit was made
The obvious changes (server-side question search, removing article bodies, list pagination/windowing) affect editor completeness and search behavior. Without an admin fixture and representative dataset, a code change could improve static metrics while hiding content or breaking editorial workflows.

## Next verification once fixture exists
```bash
bun run type-check
bun run lint
bun run perf:hotspots
bun run perf:supabase
PLAYWRIGHT_DEMO_AUTH=true PERF_ROUTE_LIMIT=... bun run perf:frontend
```
