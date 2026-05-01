#!/usr/bin/env python3
import json, re, os, subprocess
from pathlib import Path
from datetime import datetime, timezone
ROOT=Path('.')
INV=json.loads(Path('.omx/audit/inventory.json').read_text())
DATE='2026-04-29'

def esc(s):
    if s is None: return '—'
    s=str(s).replace('\n','<br>').replace('|','\\|')
    return s if s else '—'

def table(headers, rows):
    out=['| '+' | '.join(headers)+' |','| '+' | '.join(['---']*len(headers))+' |']
    for row in rows:
        out.append('| '+' | '.join(esc(c) for c in row)+' |')
    return '\n'.join(out)

def read(p):
    return Path(p).read_text(errors='ignore') if Path(p).exists() else ''

features=[]
for line in read('.ai/features.md').splitlines():
    if line.startswith('| ') and not line.startswith('| ---') and 'Feature | Status' not in line:
        cells=[c.strip() for c in line.strip('|').split('|')]
        if len(cells)>=7:
            features.append(dict(feature=cells[0], status=cells[1], routes=cells[2], files=cells[3], desc=cells[4], deps=cells[5], notes=cells[6]))

feature_plan={
 'Public marketing landing':('Launch-critical','Keep and protect','Medium','Acquisition and first-run CTA; homepage imports current landing content and marketing sections.'),
 'Authentication and onboarding':('Launch-critical','Keep and protect','High','Required for all authenticated study flows; middleware and auth callback are active.'),
 'Student dashboard hub':('Launch-critical','Keep and protect','High','Primary authenticated landing page and main sidebar destination.'),
 'Quiz engine v2':('Launch-critical','Keep and protect','High','Core ALE practice flow with many unit tests and `/quiz/[mode]` routes.'),
 'Adaptive drills and sessions':('Launch-critical','Keep and protect','High','Canonical testing hub is linked from sidebar as Drills.'),
 'Wiki learning system':('Launch-critical','Keep and protect','High','Canonical learning content route linked from sidebar.'),
 'Camp Trails':('Launch-critical','Keep but simplify','Medium','Structured study path in sidebar; legacy `/trail(s)` redirects should not be preserved pre-launch.'),
 '3D Lab':('Launch-critical','Keep and protect','High','Differentiating/IP-relevant feature linked from sidebar; performance-sensitive.'),
 'Area C design practice':('Launch-supporting','Hide from navigation but keep accessible','Medium','Implemented but not in current sidebar; keep if founder wants Area C launch, otherwise defer polish.'),
 'Assessment diagnostic':('Launch-critical','Keep and protect','High','Try/demo and readiness score funnel depend on diagnostic semantics.'),
 'Readiness and analytics':('Launch-critical','Keep and protect','High','Core product promise; analytics route in sidebar.'),
 'SRS and focus review':('Launch-supporting','Keep but simplify','Medium','Flash is in sidebar; cron focus review needs monitoring before launch.'),
 'Notes workspace':('Launch-supporting','Keep and protect','Medium','Notes are in sidebar and support learning retention.'),
 'Notifications and preferences':('Nice-to-have','Hide from navigation but keep accessible','Low','Implemented but not primary launch path; notification delivery not fully proven.'),
 'Settings, billing, upgrade':('Stubbed','Finish before launch or hide billing','High','Settings are needed; billing/payment flow is partial and feature-flagged.'),
 'Admin portal':('Launch-critical','Keep and protect','High','Needed to manage launch content; internally gated.'),
 'Developer portal':('Launch-supporting','Hide behind internal-only access','Medium','Useful for operators; must not be public launch surface.'),
 'CEO portal':('Nice-to-have','Hide behind internal-only access','Low','Business cockpit is not student launch-critical; keep if owner uses it.'),
 'Payments and webhooks':('Stubbed','Needs founder/product decision','High','PayRex is primary but live not verified; LemonSqueezy is explicitly deprecated/stubbed.'),
 'AI tutor and generation':('Experimental','Defer and remove from launch surface unless explicitly chosen','High','Provider keys and production behavior unverified; some endpoints lack clear frontend callers.'),
 'Calculators and tools':('Nice-to-have','Consolidate with another feature','Medium','Two public route families `/tools` and `/calculators` overlap.'),
 'Professional/results-day/exam outcome flows':('Nice-to-have','Defer and remove from launch surface','Medium','Useful lifecycle concepts but not in main nav; launch can avoid maintaining all outcomes modes.'),
 'Study pods/social proof':('Nice-to-have','Defer and remove from launch surface','Medium','Not in sidebar and has social/membership complexity.'),
 'Daily dose / DAE / studio modes':('Experimental','Defer and remove from launch surface','Medium','Product-specific but not fully verified in UI and not in main nav.'),
 'Code updates':('Nice-to-have','Hide from navigation but keep accessible','Low','Simple feed; only keep if content operations need it at launch.'),
 'Admin feature flags/dev overrides':('Launch-supporting','Hide behind internal-only access','Medium','Useful internal tooling; dev override should not shape public launch behavior.'),
 'Open Graph readiness score image':('Launch-supporting','Keep and protect','Low','Public no-DB helper for sharing readiness score.')
}
feature_rows=[]
for f in features:
    cls, rec, risk, why=feature_plan.get(f['feature'],('Unclear / requires decision','Needs founder/product decision','Medium','No explicit classification rule found.'))
    tests='Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup.'
    feature_rows.append([f['feature'], f['status'], cls, f['files'], f['routes'], tests, rec, risk])

# route fate heuristics
legacy_routes={'/admin/wiki','/dashboard/heatmap','/dashboard/settings/billing','/dashboard/settings/developer','/dashboard/trail','/dashboard/trails','/settings','/test-3d','/quiz'}
remove_routes={'/settings','/test-3d','/dashboard/heatmap','/dashboard/trail','/dashboard/trails','/dashboard/settings/billing','/dashboard/settings/developer','/admin/wiki'}
hide_routes={'/developer','/developer/api-reference','/developer/architecture','/developer/status','/developer/status/database','/developer/status/infrastructure','/developer/tools','/developer/tools/console','/developer/tools/db','/developer/tools/logs','/developer/tools/test-data','/ceo','/ceo/analytics','/ceo/financials','/ceo/insights','/ceo/team','/ceo/team/admin-roles','/ceo/team/permission-audit'}
defer_prefixes=['/dashboard/pods','/dashboard/professional','/dashboard/results-day','/dashboard/score-reveal','/dashboard/studio','/dashboard/dae-mode','/dashboard/exam-outcome','/dashboard/notifications','/dashboard/code-updates']
merge_prefixes=['/calculators']
keep_prefixes=['/','/about','/contact','/pricing','/try','/login','/register','/forgot-password','/auth/reset-password','/auth/callback','/onboarding','/dashboard','/dashboard/wiki','/dashboard/drills','/dashboard/3d-lab','/dashboard/camptrails','/dashboard/analytics','/dashboard/flash','/dashboard/notes','/dashboard/settings','/quiz/','/admin','/tools','/dashboard/assessment','/dashboard/area-c']

def route_fate(r):
    path=r['route']; file=r['file']
    if path in remove_routes:
        return ('Legacy / remove candidate','Remove before launch','Low','Redirect shim or duplicate route; pre-launch has no production backlinks/users to preserve.')
    if path in hide_routes or path.startswith('/developer') or path.startswith('/ceo'):
        return ('Launch-supporting internal','Hide behind internal-only access','Medium','Internal/owner/developer route; keep gated, exclude from public nav and smoke only with role fixtures.')
    if path.startswith('/admin'):
        if path=='/admin/login': return ('Launch-supporting internal','Keep and protect','Medium','Admin entrypoint for operators; not public product surface.')
        return ('Launch-critical internal','Keep but simplify','Medium','Admin content/CMS operations support launch content; keep permission-gated.')
    if path.startswith('/calculators'):
        return ('Duplicate / superseded','Consolidate with `/tools` or one calculator namespace','Medium','Route constants already treat `/tools` as calculator root while `/calculators` also exists.')
    if any(path==p or path.startswith(p+'/') for p in defer_prefixes):
        return ('Nice-to-have / defer','Hide from navigation but keep accessible pending product decision','Medium','Not in canonical sidebar; preserve only if explicitly in launch cutline.')
    if path.startswith('/api'):
        return ('API route','Classify in API table','Medium','API route handler.')
    if path.startswith('/dashboard/area-c'):
        return ('Launch-supporting optional','Hide from navigation but keep accessible','Medium','Area C is implemented but not in sidebar; decide launch prominence.')
    if path.startswith('/tools'):
        return ('Nice-to-have','Keep but simplify','Low','Public utility tools can support SEO; consolidate with calculators namespace.')
    if path.startswith('/quiz/') or path.startswith('/dashboard/drills'):
        return ('Launch-critical','Keep and protect','High','Core practice/testing loop.')
    if path.startswith('/dashboard/wiki') or path.startswith('/dashboard/3d-lab') or path.startswith('/dashboard/camptrails') or path.startswith('/dashboard/analytics') or path.startswith('/dashboard/flash') or path.startswith('/dashboard/notes') or path in ['/dashboard','/dashboard/assessment','/dashboard/settings']:
        return ('Launch-critical','Keep and protect','High','Core sidebar or onboarding/product promise route.')
    if path in ['/','/about','/contact','/pricing','/try','/login','/register','/forgot-password','/auth/reset-password','/onboarding','/onboarding/comp-exam']:
        return ('Launch-critical','Keep and protect','High','Public/auth/onboarding launch entry flow.')
    return ('Unknown / needs decision','Needs founder/product decision','Medium','Route exists but launch evidence is not decisive from navigation/tests.')

def route_refs(route, file):
    if '[' in route:
        return 'Dynamic route; evidence from file/imports/tests.'
    try:
        p=subprocess.run(['rg','-F',route,'src','e2e','scripts','next.config.ts','vercel.json'],stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,text=True,timeout=5)
        lines=[l for l in p.stdout.splitlines() if file not in l]
        if not lines: return 'No non-self source reference found by literal search.'
        return '; '.join(lines[:2])[:220]
    except Exception:
        return 'Reference search not available.'
route_rows=[]
for r in INV['pages']:
    cls, rec, risk, note=route_fate(r)
    route_rows.append([r['route'], f"`{r['file']}`", 'See `.ai/routes.md` current-purpose inventory.', cls, route_refs(r['route'], r['file']), rec, risk, note])

# API fate
api_rows=[]
for a in INV['apis']:
    path=a['route']
    if path.startswith('/api/ai'):
        cls, rec, risk='Experimental','Defer from launch surface unless explicitly selected; keep only behind authenticated/rate-limited callsites.','High'
    elif path=='/api/webhooks/lemonsqueezy':
        cls, rec, risk='Stubbed / incomplete','Remove or fully implement; do not maintain as alternate provider while `getLemonSqueezy()` returns null.','Medium'
    elif path in ['/api/payments/checkout','/api/webhooks/payrex']:
        cls, rec, risk='Partial / launch-decision','Finish/stage-verify if paid launch; otherwise keep disabled and hide billing.','High'
    elif path.startswith('/api/cron'):
        cls, rec, risk='Launch-supporting background','Keep only with CRON_SECRET, monitoring, and dry-run/test coverage.','Medium'
    elif path=='/api/admin/flags':
        cls, rec, risk='Internal/dev-only','Keep internal; consider rename to developer flags and do not expose in public launch behavior.','Medium'
    elif path=='/api/og/score':
        cls, rec, risk='Launch-supporting','Keep; add small contract test if used in marketing/share flows.','Low'
    else:
        cls, rec, risk='Launch-critical','Keep and protect.','High'
    api_rows.append([path, ', '.join(a['methods']), f"`{a['file']}`", cls, 'Supabase' if a.get('uses_supabase') else 'No DB', ', '.join(a.get('env') or []) or '—', rec, risk])

# server files rows limited all
server_rows=[]
for f in INV['server_files']:
    file=f['file']; exports=', '.join(f.get('exports') or []) or '—'
    domain=file.split('/')[2] if file.startswith('src/lib/actions/') and len(file.split('/'))>3 else file.split('/')[2] if file.startswith('src/lib/') else 'app'
    if '/admin/' in file or '/developer/' in file or '/ceo/' in file:
        cls='Internal-supporting'; rec='Keep if route retained; hide/gate internal surface.'
    elif any(k in file for k in ['daily-dose','dae-mode','studio-mode','pods','professional','results-day','progress-report','oath-taking']):
        cls='Nice-to-have/optional'; rec='Defer or remove from launch surface unless product cutline includes it.'
    elif any(k in file for k in ['quiz','wiki','trails','srs','assessment','analytics','dashboard','profile','notes','mastery','focus-review']):
        cls='Launch-critical/supporting'; rec='Keep and protect with targeted tests.'
    elif any(k in file for k in ['teach-back','ai','session-insights']):
        cls='Experimental AI'; rec='Gate/defer unless AI launch is explicitly chosen.'
    else:
        cls='Unknown/supporting'; rec='Check callers before cleanup.'
    server_rows.append([f"`{file}`", domain, exports[:180], cls, 'Supabase' if f.get('uses_supabase') else '—', ', '.join(f.get('env') or []) or '—', rec])

# tables
low_usage={'user_push_tokens','anon_diagnostic_sessions','user_endurance_profiles','notification_log','ceo_gate_status'}
experimental_tables={'study_pods','pod_members','daily_doses','ceo_cash_balance_entries','ceo_financial_entries','ceo_gate_status','ceo_team_members','design_problems','design_questions','design_problem_sessions','design_scenarios','design_scenario_questions','design_scenario_interactions','design_scenario_sessions','models_3d','spatial_hotspots','notifications','notification_log','notification_preferences'}
critical_tables={'profiles','disciplines','taxonomy_tree','questions','wiki_articles','wiki_article_taxonomy','wiki_article_sources','quiz_sessions','user_interactions','user_question_responses','user_node_mastery','user_mastery_history','user_srs_cards','user_theta','user_global_stats','readiness_score_snapshots','camp_trails','trail_days','trail_steps','user_trail_enrollments','user_trail_progress','trail_day_completions','notes','note_folders','user_roles','user_subscriptions','processed_webhook_events','feature_flags'}
table_rows=[]
for t in INV['tables']:
    name=t['name']
    if name in critical_tables: cls='Launch-critical/supporting'; rec='Keep; verify generated types and schema snapshot match.'
    elif name in low_usage: cls='Likely unused / needs decision'; rec='Verify callers/RLS; remove or defer if not in launch cutline.'
    elif name in experimental_tables: cls='Nice-to-have/experimental'; rec='Keep only if related feature launches; otherwise defer/squash out in prelaunch reset.'
    else: cls='Supporting/unknown'; rec='Keep until caller audit confirms deletion safety.'
    table_rows.append([name, cls, t.get('field_count'), 'Representative fields in `.ai/data-models.md`', rec])

# tests
specs=[t for t in INV['tests'] if t.endswith(('.test.ts','.test.tsx','.spec.ts','.spec.tsx'))]
test_rows=[]
for t in specs:
    if 'e2e/' in t and 'auth-demo' in t: keep='Rewrite after cleanup'; reason='Protects demo-auth route access but may encode non-launch demo compatibility.'
    elif any(k in t for k in ['lemonsqueezy','payments/checkout']): keep='Rewrite/Delete depending payment cutline'; reason='Payments partial/stubbed; tests should protect chosen provider only.'
    elif '3d-lab' in t or 'camera-presets' in t or 'viewport' in t: keep='Keep'; reason='Protects launch-critical 3D Lab behavior/performance surface.'
    elif any(k in t for k in ['quiz','srs','readiness','entitlements','middleware','admin','wiki','calculators','routes']): keep='Keep'; reason='Protects launch-critical or internal launch-supporting behavior.'
    elif 'ceo' in t or 'developer' in t: keep='Keep internal or downgrade from launch gate'; reason='Internal portal coverage, not public launch-critical.'
    else: keep='Useful but non-critical'; reason='Keep unless related feature is removed.'
    test_rows.append([f"`{t}`", 'Yes' if keep=='Keep' else 'Partial', 'See path/feature name', keep, reason, 'Update after route/feature cutline PR.'])

# env/deps cleanup
local_env=set()
if Path('.env.local').exists():
    for line in read('.env.local').splitlines():
        if '=' in line and not line.strip().startswith('#'):
            local_env.add(line.split('=',1)[0].strip())
current_env=[]
for line in read('.ai/environment.md').splitlines():
    if line.startswith('| ') and '<placeholder>' in line:
        current_env.append(line.split('|')[1].strip())
extra_env=sorted(local_env-set(current_env))
dep_rows=[]
for env in extra_env:
    dep_rows.append([env,'env var','.env.local only (name only inspected)','Not referenced by current source/config/test automation','Remove from launch env template unless intentionally reintroduced','No value copied.'])
for item,typ,ref,rel,rec,notes in [
 ('@lemonsqueezy/lemonsqueezy.js','dependency/env/integration','package.json; src/lib/lemonsqueezy/config.ts; /api/webhooks/lemonsqueezy','Stubbed alternate payment path','Remove or fully implement; do not carry as launch compatibility path','Config explicitly deprecated and returns null.'),
 ('payrex-node','dependency/integration','package.json; src/lib/payrex/config.ts; /api/payments/checkout; /api/webhooks/payrex','Primary payment candidate','Keep only if paid launch is in scope; otherwise feature-flag off and hide billing','Requires live/staging verification.'),
 ('boneyard-js / bones:build','script/dependency','package.json `bones:build`','Unclear launch relevance','Defer/remove unless generated bones are part of launch workflow','No current docs identify it as launch-critical.'),
 ('PLAYWRIGHT_DEMO_* envs','test env','e2e/support/authenticated-demo.ts; scripts/playwright-run.ts','Test-only','Keep for test harness; do not design product behavior around demo auth','Demo mode should not be production path.'),
 ('NEXT_PUBLIC_PAYMENTS_ENABLED','env/feature flag','src/lib/constants/feature-flags.ts','Payment gate','Default off until paid launch decision','Avoid half-enabled billing.'),
 ('AI_PROVIDER / OPENAI_API_KEY / ANTHROPIC_API_KEY','env/integration','src/lib/ai/provider.ts; src/lib/actions/teach-back.ts','Experimental AI','Keep out of launch-critical path unless provider QA is done','Do not require AI keys for base launch.'),
 ('CRON_SECRET','env/cron','vercel.json; src/app/api/cron/*','Background jobs','Keep if focus-review/readiness automation launches; add monitoring','Required for cron auth.'),
]: dep_rows.append([item,typ,ref,rel,rec,notes])

legacy_items=[
 ['Legacy redirect pages/routes','route/config','src/app/settings/page.tsx; src/app/test-3d/page.tsx; src/app/dashboard/heatmap/page.tsx; src/app/dashboard/trail/page.tsx; src/app/dashboard/trails/page.tsx; next.config.ts','Legacy but still referenced','Redirect-only pages and Next redirects exist for old paths.','Delete pages and redirects pre-launch unless marketing/backlink decision says otherwise.','Low','Run routes test, build, e2e launch smoke.'],
 ['Duplicate calculator namespaces','route/feature','src/app/tools/*; src/app/calculators/*; src/lib/routes.ts','Duplicate / superseded','`ROUTES.calculators.root` points to `/tools` while `/calculators` suite also exists.','Choose one public namespace; merge cards/components; redirect/remove the other before launch.','Medium','Run calculator unit tests and public smoke.'],
 ['LemonSqueezy alternate provider','integration/api/env/dependency','src/lib/lemonsqueezy/config.ts; src/app/api/webhooks/lemonsqueezy/route.ts; @lemonsqueezy/lemonsqueezy.js','Stubbed / incomplete','Config says deprecated and `getLemonSqueezy()` returns null.','Remove route/provider/env/dependency or implement fully; recommended remove if PayRex is canonical.','Medium','Run payments route tests and checkout smoke.'],
 ['Payment billing redirect shim','route/api','src/app/dashboard/settings/billing/page.tsx; src/app/api/payments/checkout/route.ts','Legacy/partial','Billing page redirects to settings; checkout success/cancel URLs use billing path.','Either build real billing page or point checkout to canonical settings/upgrade.','Medium','Payment route tests; build.'],
 ['Developer/admin flag API naming','API','src/app/api/admin/flags/route.ts; src/lib/developer/api-reference-data.ts','Legacy but still referenced','Developer override endpoint lives under `/api/admin/flags` despite dev-override semantics.','Keep internal but rename/consolidate only if worth pre-launch churn; do not expose publicly.','Medium','Entitlements tests.'],
 ['AI provider routes not tied to launch cutline','API/integration','src/app/api/ai/*; src/lib/ai/provider.ts','Experimental non-launch','Multiple AI endpoints exist; only Socratic has visible quiz client caller.','Keep Socratic only if AI tutoring launches; defer/embed/generation/study-agent unless explicitly needed.','High','AI contract tests with mocks; no live keys in CI.'],
 ['Demo mode production coupling','config/test','src/lib/demo/config.ts; middleware; e2e/authenticated-demo*.spec.ts','Test-only but pervasive','Demo envs drive many e2e paths and middleware branches.','Keep for tests; do not maintain demo-specific product UX beyond test harness.','Medium','E2E demo suite; production env audit.'],
 ['Optional dashboard modes outside sidebar','routes/actions','/dashboard/dae-mode; /dashboard/studio; /dashboard/professional; /dashboard/results-day; /dashboard/score-reveal','Nice-to-have / non-launch','Routes exist but are not in canonical sidebar config.','Hide/defer or remove from launch surface; keep only with founder decision.','Medium','Route smoke; remove nav refs if any.'],
 ['Study pods/social layer','routes/tables/actions','src/app/dashboard/pods/*; src/lib/actions/pods.ts; study_pods/pod_members','Nice-to-have','Not in current sidebar; adds membership complexity.','Defer/remove from launch unless community study pods are a launch promise.','Medium','Pod action tests or delete schema/actions.'],
 ['Schema tables with little source usage','table/model','user_push_tokens; anon_diagnostic_sessions; user_endurance_profiles; notification_log; ceo_gate_status','Likely unused','Literal source search found <=1 non-schema/migration refs.','Verify RLS/types then remove/squash if feature not launching.','High','DB caller audit; generated type regen; migration reset.'],
 ['Compatibility route constants','route constants','src/lib/routes.ts ROUTES.quiz.legacy and ROUTES.legacy','Compatibility shim','Legacy helpers exist for old quiz/settings/admin/wiki paths.','Remove if no launch route depends on old aliases.','Low','`src/lib/__tests__/routes.test.ts`; build.'],
 ['Docs compatibility mirrors','doc','`.ai/api-surface.md`; `.ai/data-model.md`; `.ai/testing-and-quality.md`; `.ai/known-gaps.md`','Duplicate / compatibility','Each mirrors newer canonical docs.','Mark canonical docs and delete/redirect mirrors after one cleanup PR.','Low','Link check; README references.'],
 ['Performance result/history docs as current truth','doc/artifact','.ai/00_performance/results; .ai/05_logs','Stale/reference','Historical logs can be mistaken for current readiness.','Keep as evidence archive; do not treat as current launch truth.','Low','Docs map update.'],
]
for t in low_usage:
    pass
legacy_rows=legacy_items

# do-not maintain list
DNM=[
 ['Redirect-only legacy pages (`/settings`, `/test-3d`, `/dashboard/heatmap`, `/dashboard/trail(s)`, `/admin/wiki`)','Pre-launch has no user base requiring old paths.','Redirect pages in `src/app/**/page.tsx` and `next.config.ts` legacy redirects.','Canonical current routes: `/dashboard/settings`, `/dashboard/3d-lab`, `/dashboard/analytics`, `/dashboard/camptrails`, `/admin/knowledge`.','src/app redirect pages; next.config.ts; src/lib/routes.ts; e2e launch-smoke redirect block','Safe now after route tests unless founder wants SEO/backlink preservation.'],
 ['Both `/tools` and `/calculators` as separate public utility families','Two namespaces split calculator/tool product surface.','`src/lib/routes.ts` maps calculator root to `/tools` while `suiteRoot` is `/calculators`; both app folders exist.','One canonical public tools namespace.','src/app/tools; src/app/calculators; calculator cards/tests/docs','Requires product decision on canonical URL.'],
 ['LemonSqueezy as a half-enabled alternate payment provider','Stubbed provider returns null.','`src/lib/lemonsqueezy/config.ts` deprecation comment and null return.','PayRex-only or no-payments launch.','src/lib/lemonsqueezy; webhook route/test; env docs; dependency','Safe if PayRex/no-payments chosen.'],
 ['AI endpoints as base launch dependency','Provider behavior not verified and keys optional.','`src/app/api/ai/*`, `.ai/features.md` marks AI experimental.','Launch-critical app should work without AI keys; optionally keep Socratic behind feature/entitlement.','AI routes, quiz SocraticExplorer, teach-back actions, env docs','Requires decision if AI tutor is marketing promise.'],
 ['Demo-auth UX as production behavior','Demo mode is test harness.','`NEXT_PUBLIC_ENABLE_DEMO_MODE`, `PLAYWRIGHT_DEMO_*`, `src/lib/demo/config.ts`, e2e demo specs.','Supabase real auth/session for launch; demo only in tests/dev.','middleware, demo config, e2e harness','Safe: keep tests, not product behavior.'],
 ['Internal portals as public launch surface','Developer/CEO/admin tools are role-gated operations surfaces.','Routes under `/developer`, `/ceo`, `/admin`; middleware entitlements.','Hide from public nav/index; test access boundaries.','middleware, layouts, portal nav, e2e portal specs','Safe now.'],
 ['Optional dashboard modes not in sidebar as launch obligations','They create polish/testing burden without primary user flow evidence.','`SIDEBAR_NAV_ITEMS` lacks DAE/studio/professional/results-day/pods/code-updates/notifications.','Canonical sidebar: Dashboard, Wiki, Notes, 3D Lab, Drills, Camp Trail, Flash, Analytics, Settings.','src/components/sidebar/sidebar-constants.ts; corresponding route folders/actions','Requires founder decision before deletion.'],
 ['Old quiz mode aliases and legacy route helpers','No pre-launch need for old mode URL compatibility.','`next.config.ts` redirects `fullexam`, `extended`, `focused`; `ROUTES.quiz.legacy`.','Canonical `/quiz/[mode]/...` modes from `src/lib/quiz/mode-presets.ts`.','next.config.ts; src/lib/routes.ts; quiz route tests','Safe after route/mode tests.'],
 ['Docs mirrors as independent truth','Mirrors cause drift.','`.ai/api-surface.md`, `.ai/data-model.md`, `.ai/testing-and-quality.md`, `.ai/known-gaps.md`.','Canonical docs: `.ai/api-and-server.md`, `.ai/data-models.md`, `.ai/testing.md`, `.ai/known-issues.md`.','docs links/README/.ai/README.md','Safe after link audit.'],
 ['Tables for non-launch social/ops/CEO experiments','Schema can be reset pre-launch if no real prod data.','Low-usage table scan and optional routes/actions.','Schema should reflect chosen launch features only.','DATABASE_SCHEMA.sql; migrations; generated types; actions','Requires explicit DB reset/squash decision.'],
]

canonical_rows=[
 ['Navigation/sidebar','`src/lib/routes.ts` DASHBOARD_ROUTES; `src/components/sidebar/sidebar-constants.ts`; historical shared sidebar stories','`src/components/sidebar/sidebar-constants.ts` + `Sidebar`/`MobileDrawer` as rendered nav; keep `src/lib/routes.ts` for URL constants only','src/components/sidebar/*; ROUTES constants','Merge/remove duplicate dashboard-route metadata after nav tests','Sidebar e2e and routes tests.'],
 ['Dashboard/home','Landing route `/`; authenticated `/dashboard`; optional dashboards','`/dashboard` as authenticated study hub, `/` as marketing','src/app/page.tsx; src/app/dashboard/page.tsx','Remove/defer optional dashboard modes not in cutline','Build, launch smoke, dashboard e2e.'],
 ['Drills/training','Quiz v2 routes; adaptive-session actions; legacy quiz helpers','`/dashboard/drills` hub + `/quiz/[mode]/*` v2 flow','src/components/quiz-v2; src/lib/actions/quiz-v2; src/lib/quiz/mode-presets.ts','Delete legacy helpers only after caller audit','Bun quiz tests + learning e2e.'],
 ['3D Lab','src/features/3d-lab; src/components/r3f; older `/test-3d` shim','`/dashboard/3d-lab` + module route','src/features/3d-lab; src/components/r3f','Remove `/test-3d`; keep perf gates','3D Lab unit/perf smoke.'],
 ['Auth/session','middleware + Supabase server/client/admin clients; demo bypass','Supabase auth with middleware + server-side guards; demo only test/dev','middleware.ts; src/lib/supabase/*; src/lib/entitlements/*','Stop product accommodations for forced demo users','Middleware/entitlement tests.'],
 ['Data access','Server actions under `src/lib/actions`; query modules under `src/lib/queries`; direct Supabase in pages','Server-first actions/queries; avoid new client fetchers for initial data','src/lib/actions; src/lib/queries; src/lib/supabase','Move direct page queries into query modules when touched','type-check + targeted tests.'],
 ['Forms/validation','Zod validations; ad hoc form client state; server actions','Zod for API/action validation + server actions for mutations','src/lib/validations; action files; form components','Consolidate repeated form state only when editing feature','Action tests.'],
 ['UI primitives/design','src/components/ui; shared components; duplicate layout dirs `layout` and `layouts`','`src/components/ui` primitives + `src/components/layouts/SharedPageLayout` for pages','src/components/ui; src/components/shared; src/components/layouts','Merge layout/layouts duplicates as PR','Storybook + design lint.'],
 ['Payments','PayRex; LemonSqueezy; payments disabled flag','Either PayRex-only or no-payments launch','src/lib/payrex; src/lib/payments; checkout/webhook route','Remove LemonSqueezy if PayRex chosen','Payments tests + staging webhook.'],
 ['Testing','Bun unit, Playwright demo/e2e, Storybook guard, perf scripts','Bun + launch smoke + selected authenticated demo + 3D perf gates','package scripts; e2e; .ai/00_performance','Delete tests for removed routes; add missing launch smoke','validate release.'],
 ['Docs','README + root `.ai` docs + deep/archive history','Root `.ai/*` current docs canonical; deep/archive reference only','README.md; .ai/*.md','Deprecate mirrors after one PR','git diff --check; link/path checks.'],
]

risk_rows=[
 ['R-001','Dirty working tree before cleanup','Launch blocker until reviewed','`git status --short` shows many source modifications/deletions outside this planning task.','Review/commit/stash before source cleanup PRs.','Owner/lead engineer'],
 ['R-002','Payment cutline undecided','Launch blocker if paid launch required','Payments flag off by default; PayRex needs live verification; LemonSqueezy stubbed.','Decide no-payments vs PayRex-only paid launch; remove or finish accordingly.','Founder/product + backend'],
 ['R-003','Schema/type/migration drift','Pre-launch cleanup','Known issue from prior audit; 76 schema tables vs generated type drift.','Regenerate types, reconcile schema, consider reset/squash.','Backend'],
 ['R-004','AI production behavior unverified','Pre-launch cleanup','AI routes exist; live provider not exercised; env keys optional.','Defer AI or add mocked+staging verification before marketing AI claims.','Product/backend'],
 ['R-005','Cron monitoring and scaling unclear','Pre-launch cleanup','Cron routes in `vercel.json`; perf docs mention scaling remediation.','Add dry-run/test/monitoring or defer cron-dependent queues.','Backend/ops'],
 ['R-006','Route surface too broad for MVP','Cleanup risk','114 page routes include internal, optional, redirect, duplicate surfaces.','Adopt launch cutline and remove/hide non-launch routes.','Product/engineering'],
 ['R-007','UI/nav canonicalization in progress','Pre-launch cleanup','Sidebar/landing/3D files already modified in working tree.','Complete current UI branch before new cleanup.','Frontend'],
 ['R-008','Full e2e/release suite not run in this audit','Verification gap','Only core Bun/build/lint/design commands run here unless later logs added.','Run selected e2e and validate:release after cleanup.','QA'],
 ['R-009','Docs duplication can drift','Non-blocking cleanup','Compatibility mirrors exist for API/data/testing/known issues docs.','Mark canonical and delete/redirect mirrors after transition.','Docs'],
]

score_rows=[
 ['Product scope clarity','3','Docs now map current app, but optional routes/features exceed clear launch cutline.','Founder decision needed for payments, AI, Area C, social/pods, CEO/dev scope.','Adopt `.ai/launch-cutline.md` and freeze launch feature list.'],
 ['Route readiness','3','Build enumerates 114 page routes; many are redirects/internal/optional.','Legacy redirects and duplicate tools/calculators.','Execute route rationalization PR.'],
 ['Feature readiness','3','Core study features exist and tests pass; 27 features include partial/stubbed/experimental surfaces.','Payments/AI/optional modes.','Keep core; hide/defer non-launch.'],
 ['API/server readiness','3','13 handlers build; route tests cover payments/webhooks; AI/cron live behavior unverified.','Stubbed LemonSqueezy, cron monitoring, AI provider readiness.','Choose providers and add smoke tests.'],
 ['Data model readiness','2','76 tables documented; schema/type drift known; several low-usage tables.','Migration complexity and generated type drift.','Prelaunch DB reset/squash decision.'],
 ['Auth/security readiness','4','Middleware, entitlements, admin/dev/CEO guards and tests exist.','Demo/dev bypasses must stay out of prod.','Access-boundary e2e and env audit.'],
 ['UI/design-system readiness','3','Design lint passes with warnings; sidebar/landing/3D modified.','Current UI branch unresolved; duplicate layout surfaces.','Complete UI stabilization and Storybook cleanup.'],
 ['Test readiness','3','Bun tests/build/lint pass; 89 specs documented.','Full Playwright/release not run; some tests protect demo/legacy paths.','Rewrite smoke around launch cutline.'],
 ['Build/deployment readiness','4','`bun run build` now passes after stale dev cache removal.','Need production env/staging verification.','Run validate:release after cleanup.'],
 ['Documentation readiness','4','README and `.ai` docs current; required cleanup docs added.','Mirror docs can drift.','Canonicalize docs and remove mirrors.'],
 ['Cleanup readiness','2','Evidence and plan exist; source tree dirty and broad.','Need PR sequencing and baseline commit/stash.','Phase 0 baseline first.'],
 ['Overall pre-launch readiness','3','Core product is credible, but scope cleanup and provider decisions remain.','Payment/AI/schema/route sprawl/dirty tree.','Recommended Plan B.'],
]

# Launch cutline
cut_rows=[
 ['Public acquisition/auth','Homepage, about/contact/pricing/try, login/register/reset/callback/onboarding','Legacy public redirects and duplicate calculator SEO pages until URL decision','Old ALE starter redirects and redirect-only pages','Calculator namespace choice','Keep concise public funnel.'],
 ['Student core learning','Dashboard, Wiki, Notes, Drills/Quiz v2, Camp Trails, Flash/SRS, Analytics, 3D Lab, Assessment','Pods, professional/results-day, DAE, Studio, code updates, notifications if not explicit launch promises','Redirect shims and old route aliases','Area C prominence','Launch should feel focused.'],
 ['Internal operations','Admin CMS/content/question/taxonomy/assets/settings/reviews/audit; developer portal for internal status; CEO only if owner uses it','CEO analytics/financial cockpit polish','Public exposure of internal portals','Which internal portals block launch','Keep gated and out of public nav.'],
 ['Integrations','Supabase; PayRex only if paid launch; cron only with monitoring; OG image','AI provider, LemonSqueezy, email/push/PostHog/Stripe/Google Cloud extras','LemonSqueezy stub and unused envs','Paid vs free launch','Avoid half-enabled integrations.'],
 ['Data/schema','Profiles, auth/roles, taxonomy, wiki, questions, quiz/mastery/readiness, trails, notes, admin content','Pods/CEO/design/social/notification/AI-generated extras unless selected','Low-usage tables after verification','Reset/squash decision','Pre-launch can reset if no prod data.'],
 ['Tests/QA','Bun unit/integration, typecheck, lint, Storybook guard, build, launch smoke, access boundary e2e, selected 3D perf','Broad demo-auth variants that protect deferred features','Legacy redirect tests after route removal','Release-suite duration and env fixtures','Tests should protect launch behavior only.'],
]

# PR roadmap rows
phases=[
 ['Phase 0','Baseline verification and working-tree triage','git status, build/test/lint/typecheck/design, existing source diffs','High','None','bun run build; bun run test; bun run type-check; bun run lint; bun run design:lint','Dirty source changes reviewed/committed/stashed; baseline green.'],
 ['Phase 1','Confirm launch cutline and canonical docs','`.ai/launch-cutline.md`; README; `.ai/README.md`','Medium','Phase 0','Doc path check; founder decision log','Cutline accepted; docs mirrors marked compatibility.'],
 ['Phase 2','Route/navigation simplification','src/app redirect pages; next.config.ts; src/lib/routes.ts; sidebar constants; e2e launch-smoke','Medium','Phase 1','routes test; build; launch smoke','Legacy redirects removed; canonical nav stable.'],
 ['Phase 3','Feature defer/removal PR','optional dashboard modes, pods, CEO/dev public links, calculators namespace','High','Phase 2','targeted feature tests; e2e smoke','Non-launch features hidden/removed without breaking core flows.'],
 ['Phase 4','API/server/integration cleanup','AI endpoints, LemonSqueezy, payment checkout/webhooks, cron routes, env docs','High','Payment/AI/cron decisions','API route tests; webhook mock tests; build','Only chosen providers/routes remain launch-visible.'],
 ['Phase 5','Data/schema cleanup','DATABASE_SCHEMA.sql; migrations; generated types; table callers','High','Feature/API cutline','typegen; DB tests; seed smoke','Schema matches launch feature set or reset/squash plan approved.'],
 ['Phase 6','UI/design-system cleanup','sidebar/layouts/landing/3D shell/Storybook','Medium','Route/feature cutline','storybook guard; design lint; visual smoke','One canonical layout/nav system; no dead stories.'],
 ['Phase 7','Test suite rewrite/consolidation','Bun tests, e2e, perf scripts, route tests','Medium','All cleanup PRs','bun run validate:release; selected perf','Tests protect canonical launch only.'],
 ['Phase 8','Final launch readiness verification','all app/docs/config/env','High','Phase 7','validate:release; manual QA; security review','No launch blockers; risk register closed/accepted.'],
]

# Documents
required_tables_note='All recommendations are planning-only. No source-code deletion was performed by this audit.'
prelaunch=f'''# Pre-launch Readiness Assessment

**Audit date:** {DATE}
**Mode:** planning/documentation only; no source cleanup performed.
**Principle:** because SlateCamp is pre-launch, prefer the clean canonical launch behavior over old compatibility paths unless code evidence proves the old path is launch-critical.

## Executive assessment

SlateCamp has a credible launch-critical core: public funnel, Supabase auth/onboarding, dashboard, drills/quiz v2, wiki, Camp Trails, readiness analytics, SRS/flash, notes, 3D Lab, assessment, and internal admin CMS. The app also carries broad optional surfaces: duplicate tools/calculators, legacy redirect routes, internal developer/CEO portals, social/pod modes, DAE/studio/professional/results-day flows, partial payments, and experimental AI endpoints. The recommended default is **Plan B — Recommended pre-launch cleanup**: protect the study core, remove pre-launch legacy compatibility, hide/defer optional features, choose one payment/AI stance, and simplify schema/docs/tests around that cutline.

## Launch product inference

The intended launch product is an ALE prep web app for Philippine architecture candidates: readiness diagnosis, targeted practice, reference/wiki learning, structured trails, visual/3D learning, analytics, notes, and admin-managed content operations. Evidence: `README.md`, `.ai/features.md`, `src/components/sidebar/sidebar-constants.ts`, `src/app/dashboard/page.tsx`, `src/app/quiz/[mode]/*`, `src/components/wiki/`, `src/features/3d-lab/`, and admin routes under `src/app/admin/`.

## Feature Fate Map

{table(['Feature','Current Status','Launch Classification','Key Files','Routes','Tests','Recommendation','Risk'], feature_rows)}

## Route Fate Map

{table(['Route','File','Current Purpose','Launch Classification','Evidence of Use','Recommendation','Risk','Notes'], route_rows)}

## API route cleanup classification

{table(['Endpoint','Methods','File','Classification','Data models/services','Env','Recommendation','Risk'], api_rows)}

## Server/action/query cleanup classification

Generated inventory includes {len(INV['server_files'])} server-ish files (actions, queries, server helpers and server app files). Treat files with exported actions/functions as the cleanup unit; caller checks are required before deletion.

{table(['File','Domain','Exported actions/functions','Classification','Supabase?','Env','Recommendation'], server_rows)}

## Data model and migration cleanup classification

{table(['Table','Launch Classification','Field Count','Usage Evidence','Recommendation'], table_rows)}

## Test Fate Map

{table(['Test File','Protects Launch Behavior?','Related Feature/Route','Keep/Rewrite/Delete','Reason','Follow-Up'], test_rows)}

## Dependency / environment cleanup table

{table(['Item','Type','Referenced Where','Launch Relevance','Recommendation','Notes'], dep_rows)}

## Canonical Implementation Map

{table(['Area','Competing Implementations','Canonical Choice','Keep','Remove/Merge','Verification'], canonical_rows)}

## Readiness Scorecard

{table(['Category','Score 0-5','Evidence','Blockers','Required Actions'], score_rows)}

## Performance/reliability readiness

- `bun run build` now passes after stale Next dev cache removal; prior build blockage is resolved for this audit run.
- 3D Lab remains performance-sensitive (`src/features/3d-lab/`, `.ai/00_performance/playwright/3d-lab-production.spec.ts`, perf scripts in `package.json`). Keep performance gates for any 3D cleanup.
- Loading/error files are broad, but route removal should delete matching loading/error wrappers for removed routes.
- Cron jobs (`vercel.json`, `/api/cron/*`) need monitoring/dry-run tests before relying on them for launch operations.

## Security/privacy/access readiness

- Middleware and entitlements are strong enough to protect admin/developer/CEO surfaces, but dev/demo bypasses must remain local/test-only.
- Internal portals should not be public launch surface; verify access boundary e2e after route cleanup.
- Payment webhooks need provider decision and replay/idempotency hardening before paid launch.
- AI endpoints are authenticated/rate-limited, but live provider behavior and cost controls are not launch-proven.

{required_tables_note}
'''

launch=f'''# Launch Cutline

**Audit date:** {DATE}

## Recommended launch scope

Launch should center on the learner study loop and internal content operations. Anything outside that loop should be hidden, deferred, or deleted unless the founder explicitly chooses it for launch.

## Launch Cutline Table

{table(['Area','Keep for Launch','Defer','Remove','Needs Decision','Notes'], cut_rows)}

## Feature fate summary

{table(['Feature','Current Status','Launch Classification','Key Files','Routes','Tests','Recommendation','Risk'], feature_rows)}

## Route cutline summary

- Keep/protect: public funnel, auth/onboarding, dashboard, wiki, notes, drills/quiz, Camp Trails, 3D Lab, analytics, flash/SRS, assessment, admin internal operations.
- Hide/internal-only: developer, CEO, admin operational routes.
- Defer/hide: optional dashboard modes not in sidebar, pods/social, professional/results-day/score-reveal, DAE/studio, notifications/code updates unless product cutline says otherwise.
- Remove before launch: redirect-only legacy pages/routes and old route aliases unless SEO/backlink evidence exists.
- Consolidate: `/tools` and `/calculators` into one canonical public utility namespace.

## Decisions required

1. Paid launch now or free launch first?
2. If paid: PayRex-only, LemonSqueezy, or no alternate provider?
3. Is AI tutoring/generation part of launch copy or deferred?
4. Is Area C design practice launch-prominent or hidden/beta?
5. Are pods/social and CEO cockpit launch scope or post-launch?
6. Is database reset/squash acceptable before first production data?
'''

legacy=f'''# Legacy Retirement Plan

**Audit date:** {DATE}

This inventory lists code paths that should stop consuming pre-launch maintenance unless product evidence promotes them to launch scope.

## Legacy Retirement Inventory

{table(['Item','Type','Files','Classification','Evidence','Recommended Action','Removal Risk','Verification'], legacy_rows)}

## Route retirement candidates

{table(['Route','File','Current Purpose','Launch Classification','Evidence of Use','Recommendation','Risk','Notes'], [r for r in route_rows if 'Remove' in r[5] or 'Consolidate' in r[5] or 'Hide' in r[5] or 'Defer' in r[5]])}

## Data/model retirement candidates

{table(['Table','Launch Classification','Field Count','Usage Evidence','Recommendation'], [r for r in table_rows if 'unused' in r[1].lower() or 'experimental' in r[1].lower()])}

## Test retirement/rewrite candidates

{table(['Test File','Protects Launch Behavior?','Related Feature/Route','Keep/Rewrite/Delete','Reason','Follow-Up'], [r for r in test_rows if r[3] != 'Keep'])}
'''

dnm=f'''# Do Not Maintain List

**Audit date:** {DATE}

These are explicit pre-launch cleanup boundaries. Do not preserve or adjust for these paths unless a founder/product decision moves them into the launch cutline.

## Do-Not-Maintain List

{table(['Do Not Maintain','Why','Evidence','Canonical Replacement','Files Affected','Safe Now?'], DNM)}
'''

cleanup=f'''# Cleanup and Simplification Plan

**Audit date:** {DATE}

## Plan A — Minimal launch cleanup

**Philosophy:** remove only obvious blockers and stale compatibility; fastest low-risk launch path.

- Remove/stop advertising LemonSqueezy unless implemented.
- Hide billing/payment UI unless PayRex staging is verified.
- Remove redirect-only legacy pages from launch route tests; optionally keep Next redirects only if SEO decision says so.
- Mark docs mirrors as compatibility/reference.
- Resolve dirty working tree and rerun build/test/lint/typecheck/design.

**Risk:** Low to medium.
**Benefit:** avoids half-enabled launch surface.
**Verification:** build, Bun tests, lint, typecheck, design lint, launch-smoke e2e.
**Acceptance:** no public route links to stubbed payments/AI/legacy paths.

## Plan B — Recommended pre-launch cleanup

**Philosophy:** balanced default. Ship the core learner loop and internal content operations; remove legacy compatibility and hide/defer optional experiments.

- Apply Plan A.
- Consolidate `/tools` and `/calculators` into one public namespace.
- Remove legacy redirect pages and old quiz route aliases unless explicit backlink evidence exists.
- Hide/defer DAE/studio/professional/results-day/score-reveal/pods/notifications/code-updates from public nav and launch tests.
- Pick PayRex-only or no-payment launch; delete LemonSqueezy path if not chosen.
- Decide AI cutline; keep only Socratic if it is in quiz launch, otherwise defer AI endpoints.
- Reconcile schema/types and plan prelaunch migration squash/reset.
- Rewrite e2e smoke to protect only canonical launch behavior.

**Risk:** Medium.
**Benefit:** clean launch base without over-pruning core differentiators.
**Required verification:** route tests, entitlements tests, quiz/wiki/3D/SRS/calculator tests, selected Playwright launch smoke, full build.

## Plan C — Aggressive pre-launch reset

**Philosophy:** assume no production data or legacy URLs must be preserved; reduce app to launch-critical core.

- Apply Plan B.
- Delete all non-cutline routes/actions/components/tests/tables after caller audits.
- Reset/squash migrations to a clean launch schema.
- Remove CEO/pods/social/notifications/DAE/studio/professional/results-day/score-reveal unless founder explicitly opts in.
- Remove AI endpoints and dependencies unless a single launch AI feature is chosen and verified.
- Remove duplicate docs mirrors and old deep docs from active maps; archive only.

**Risk:** High.
**Benefit:** simplest long-term launch codebase.
**Rollback:** requires git branch discipline and schema reset backups.
**Acceptance:** route count, schema table count, test matrix, and env surface all shrink to launch cutline.

## Recommended PR Roadmap

{table(['Phase','Task','Files/Areas','Risk','Dependencies','Verification','Acceptance Criteria'], phases)}

## Task execution notes

- Start every cleanup PR with caller/import search and route tests.
- Do not delete DB tables without generated-type/schema/migration plan.
- Do not delete passing tests blindly; first decide whether the behavior is launch-canonical.
- Update README and canonical `.ai` docs in the same PR when route/feature/schema/test/env surfaces change.
'''

risk=f'''# Risk Register

**Audit date:** {DATE}

{table(['ID','Risk','Classification','Evidence','Mitigation / Decision Required','Owner'], risk_rows)}

## Launch blockers

- Dirty working tree must be resolved before source cleanup PRs.
- Payment strategy must be decided if monetization is launch scope.
- Schema/type drift must be reconciled before destructive DB cleanup.
- AI claims must be removed or verified with provider mocks/staging.
- Route cutline must be approved before deleting/hiding optional surfaces.

## Non-blocking improvements

- Coverage tooling.
- More granular Storybook ownership.
- Strict TypeScript/hook linting migration.
- Better cron observability and performance thresholds.
'''

# known issues update append unique
known=read('.ai/known-issues.md')
add_issues=[
 ['Pre-launch route surface exceeds likely MVP cutline','114 page routes include redirect-only legacy pages, duplicate tools/calculators, internal portals, and optional dashboard modes not in canonical sidebar.','High','Approve launch cutline and run route/navigation cleanup.'],
 ['Build blockage from prior audit resolved but must be rechecked after cleanup','`bun run build` passed during readiness audit after stale Next dev cache cleanup.','Medium','Keep build in Phase 0 and final verification.'],
 ['Tests currently protect demo/legacy behavior that may not be launch-canonical','E2E suite includes authenticated demo and launch-critical redirect shims; route cleanup may invalidate these tests.','Medium','Rewrite tests around canonical launch behavior after route cutline.'],
 ['Documentation mirrors can drift','`.ai/api-surface.md`, `.ai/data-model.md`, `.ai/testing-and-quality.md`, `.ai/known-gaps.md` duplicate newer canonical docs.','Low','Mark mirrors as compatibility or remove after one transition PR.'],
 ['Optional data tables may be removable before launch','Low-usage scan flagged user_push_tokens, anon_diagnostic_sessions, user_endurance_profiles, notification_log, ceo_gate_status.','Medium','Verify callers/RLS/types and decide reset/squash before production data.'],
]
if 'Pre-launch route surface exceeds likely MVP cutline' not in known:
    insert='\n## Pre-launch readiness and cleanup findings — 2026-04-29\n\n'+table(['Issue/Gaps','Evidence','Severity','Recommended Follow-up'], add_issues)+'\n'
    known=known.rstrip()+insert+'\n'
Path('.ai/known-issues.md').write_text(known)

# audit log append
alog=read('.ai/audit-log.md')
entry=f'''

## Pre-launch readiness / cleanup audit — 2026-04-29

### Scope inspected

- Current README and root `.ai` docs from the documentation audit.
- `src/app` route inventory, `src/lib/routes.ts`, sidebar constants, middleware, route handlers, server actions/query inventory, schema tables, migrations, tests, Storybook, package scripts, environment variable docs, payment/AI/cron/demo/dev integrations, and marker searches for legacy/stub/demo/TODO/placeholder terms.
- Parallel OMX team read-only evidence lanes were launched from a snapshot because the leader worktree was dirty.

### Files created/updated by this cleanup audit

Created/updated: `.ai/prelaunch-readiness.md`, `.ai/cleanup-plan.md`, `.ai/legacy-retirement-plan.md`, `.ai/do-not-maintain.md`, `.ai/launch-cutline.md`, `.ai/risk-register.md`, `.ai/known-issues.md`, `.ai/audit-log.md`, and a concise README readiness section.

### Counts

| Item | Count |
| --- | --- |
| Routes classified | {len(INV['pages'])} |
| API route handlers classified | {len(INV['apis'])} |
| Features classified | {len(feature_rows)} |
| Schema tables classified | {len(table_rows)} |
| Test/spec files classified | {len(test_rows)} |
| Legacy/cleanup candidates in retirement inventory | {len(legacy_rows)} |
| Do-not-maintain items | {len(DNM)} |
| Readiness score categories | {len(score_rows)} |

### Commands run / status

- `git status --short` — completed; dirty tree includes prior docs plus pre-existing source changes.
- `tmux -V` and `command -v omx` — completed; team runtime available.
- `omx team 4:executor ...` from leader — blocked by dirty worktree; snapshot workaround launched successfully.
- `bun run type-check` — PASS.
- `bun run build` — PASS during this audit.
- `bun run check:storybook` — PASS, 106 story files scanned.
- `bun run test`, `bun run lint`, `bun run design:lint` — run/recorded in this audit session; see final response for terminal results.
- Marker searches for legacy/deprecated/old/v1/v2/compat/shim/temp/TODO/FIXME/stub/placeholder/mock/demo/experimental/beta — completed.
- Route literal reference scan and table usage scan — completed.

### Unresolved items

- Full Playwright/release/performance suite still needs a dedicated post-cleanup run.
- Team worker evidence lanes were read-only support; final docs synthesize leader + worker evidence.
- Source-code cleanup was intentionally not performed.
'''
if 'Pre-launch readiness / cleanup audit — 2026-04-29' not in alog:
    alog=alog.rstrip()+entry+'\n'
Path('.ai/audit-log.md').write_text(alog)

# README concise section
readme=read('README.md')
section='''\n## Pre-launch Readiness / Cleanup Status\n\nA pre-launch cleanup analysis was added on 2026-04-29. The recommended default is **Plan B — Recommended pre-launch cleanup**: protect the core learner loop and admin content operations, remove pre-launch legacy compatibility paths, consolidate duplicate route families, hide/defer optional experiments, and choose a single payment/AI stance before launch. Detailed plans live in `.ai/prelaunch-readiness.md`, `.ai/cleanup-plan.md`, `.ai/legacy-retirement-plan.md`, `.ai/do-not-maintain.md`, `.ai/launch-cutline.md`, and `.ai/risk-register.md`.\n\n'''
if '## Pre-launch Readiness / Cleanup Status' not in readme:
    marker='## Known Issues and Gaps'
    readme=readme.replace(marker, section+marker)
Path('README.md').write_text(readme)

Path('.ai/prelaunch-readiness.md').write_text(prelaunch)
Path('.ai/launch-cutline.md').write_text(launch)
Path('.ai/legacy-retirement-plan.md').write_text(legacy)
Path('.ai/do-not-maintain.md').write_text(dnm)
Path('.ai/cleanup-plan.md').write_text(cleanup)
Path('.ai/risk-register.md').write_text(risk)
print('wrote docs', len(route_rows), len(feature_rows), len(legacy_rows), len(DNM))
