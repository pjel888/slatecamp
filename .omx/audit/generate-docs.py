import json, pathlib, re, textwrap, datetime
from collections import defaultdict
ROOT=pathlib.Path('.')
inv=json.loads(pathlib.Path('.omx/audit/inventory.json').read_text())
env_inv=json.loads(pathlib.Path('.omx/audit/env-inventory.json').read_text())
AUDIT_DATE='2026-04-29'

def esc(s):
    s='' if s is None else str(s)
    return s.replace('|','\\|').replace('\n','<br>')

def table(headers, rows):
    out=['| '+' | '.join(headers)+' |','| '+' | '.join(['---']*len(headers))+' |']
    for r in rows:
        out.append('| '+' | '.join(esc(c) for c in r)+' |')
    return '\n'.join(out)+'\n'

def rels(items, limit=5):
    if not items: return '—'
    shown=[]
    for x in items[:limit]:
        shown.append(f'`{x}`')
    extra=len(items)-limit
    return ', '.join(shown)+(f' (+{extra})' if extra>0 else '')

def route_purpose(route):
    if route=='/': return 'Marketing landing page for ALE preparation and product entry.'
    seg=[s for s in route.strip('/').split('/') if s]
    if not seg: return 'Root page.'
    if seg[0]=='admin':
        if route=='/admin/login': return 'Standalone admin sign-in entry.'
        if 'knowledge' in seg: return 'Admin knowledge/article/question authoring and review workflow.'
        if 'taxonomy' in seg: return 'Admin taxonomy management and coverage checks.'
        if 'assets' in seg: return 'Admin media/asset library management.'
        if '3d-models' in seg: return 'Admin 3D model management surface.'
        return 'Admin operations portal surface.'
    if seg[0]=='dashboard':
        if '3d-lab' in seg: return 'Interactive 3D learning lab module browser or module experience.'
        if 'wiki' in seg: return 'Authenticated wiki/article learning surface.'
        if 'camptrails' in seg or 'trail' in seg or 'trails' in seg: return 'Structured Camp Trails study-path flow.'
        if 'analytics' in seg: return 'Student performance analytics and readiness visualization.'
        if 'area-c' in seg: return 'Area C design problem/scenario practice surface.'
        if 'notes' in seg: return 'Student notes workspace.'
        if 'settings' in seg: return 'Student account/settings surface.'
        if 'flash' in seg or 'cram-card' in seg: return 'Flashcard/cram-card review surface.'
        if 'drills' in seg: return 'Drill session dashboard and history.'
        if 'pods' in seg: return 'Study pod/social learning surface.'
        return 'Authenticated student dashboard surface.'
    if seg[0]=='quiz': return 'Quiz setup/session/results/review flow.'
    if seg[0]=='ceo': return 'Owner/CEO internal business analytics and operations portal.'
    if seg[0]=='developer': return 'Internal developer tooling/status/documentation portal.'
    if seg[0]=='calculators': return 'Construction/material calculator.'
    if seg[0]=='tools': return 'Standalone utility tool.'
    if seg[0] in ['login','register','forgot-password','onboarding','auth']: return 'Authentication or onboarding flow.'
    if seg[0]=='pricing': return 'Pricing/subscription marketing and upgrade entry.'
    if seg[0]=='try': return 'Try/demo product entry surface.'
    if seg[0]=='about': return 'Public company/product information page.'
    if seg[0]=='contact': return 'Public contact form page.'
    if seg[0]=='settings': return 'Legacy settings route; redirected to dashboard settings in Next config.'
    if seg[0]=='test-3d': return 'Legacy/test 3D route; redirected to 3D Lab in Next config.'
    return 'Application route.'

def route_notes(route):
    notes=[]
    if '[' in route: notes.append('Dynamic params present.')
    redirects={
        '/settings':'Redirect configured to `/dashboard/settings`.',
        '/dashboard/settings/billing':'Redirect configured to `/dashboard/settings`.',
        '/dashboard/settings/developer':'Redirect configured to `/developer`.',
        '/dashboard/trail':'Redirect configured to `/dashboard/camptrails`.',
        '/dashboard/trails':'Redirect configured to `/dashboard/camptrails`.',
        '/dashboard/heatmap':'Redirect configured to `/dashboard/analytics`.',
        '/admin/wiki':'Redirect configured to `/admin/knowledge`.',
        '/test-3d':'Redirect configured to `/dashboard/3d-lab`.',
    }
    if route in redirects: notes.append(redirects[route])
    return ' '.join(notes) if notes else '—'

def key_features(route):
    r=route
    if r.startswith('/admin'): return 'Admin CMS / operations'
    if r.startswith('/dashboard/3d-lab'): return '3D Lab'
    if r.startswith('/dashboard/wiki'): return 'Wiki learning'
    if r.startswith('/dashboard/camptrails') or r in ['/dashboard/trail','/dashboard/trails']: return 'Camp Trails'
    if r.startswith('/quiz'): return 'Quiz engine'
    if r.startswith('/developer'): return 'Developer portal'
    if r.startswith('/ceo'): return 'CEO portal'
    if r.startswith('/calculators') or r.startswith('/tools'): return 'Calculators/tools'
    if r.startswith('/dashboard/area-c'): return 'Area C design practice'
    if r.startswith('/dashboard/analytics'): return 'Analytics/readiness'
    if r.startswith('/dashboard/notes'): return 'Notes'
    if r.startswith('/dashboard/flash') or r.startswith('/dashboard/cram-card'): return 'Flash/cram review'
    if r.startswith('/dashboard/drills'): return 'Drills'
    if r in ['/login','/register','/forgot-password','/auth/reset-password','/onboarding','/onboarding/comp-exam','/auth/callback']: return 'Auth/onboarding'
    if r in ['/', '/about','/contact','/pricing','/try']: return 'Public marketing'
    return 'Student app'

route_rows=[]
for p in inv['pages']:
    route_rows.append([p['route'],p['type'],f"`{p['file']}`",p['access'],route_purpose(p['route']),key_features(p['route']),rels(p.get('imports',[]),3),route_notes(p['route'])])

api_manual={
 '/api/admin/flags':('POST writes dev entitlement override cookie; DELETE clears it.','POST JSON validated by `featureFlagsSchema`; DELETE has no body.','JSON `{ success: true }` or `{ error }`.','Demo mode bypasses auth; otherwise requires authenticated viewer with `devOverrideWrite`.','Dev override cookie, entitlement audit log.'),
 '/api/ai/embed':('Generate embeddings for text.','POST `{ text }`.','JSON `{ embedding }` or error.','Demo returns random vector; otherwise authenticated + rate-limited.','OpenAI embedding through `getAIProvider`; Supabase auth.'),
 '/api/ai/generate-questions':('Generate quiz questions from content chunk.','POST `{ chunkContent, profession, examTarget, difficulty, count }`.','JSON `{ questions }` or error.','Demo returns canned questions; otherwise authenticated + rate-limited.','AI provider and question-generation prompt.'),
 '/api/ai/socratic':('Socratic tutor turn for incorrect quiz answers.','POST with question text, selected/correct answer, topic, conversation history.','JSON `{ message, turnNumber, isComplete, sources }`.','Demo canned responses; otherwise authenticated + rate-limited.','AI provider; source tag extraction.'),
 '/api/ai/study-agent':('Study-agent note tools: summarize, flashcards, code_check.','POST `{ action, content }`.','JSON `{ text }` or error.','Demo canned responses; otherwise authenticated + rate-limited.','AI provider.'),
 '/api/ai/tutor':('Contextual AI tutor streaming/completion endpoint.','POST chat/tutor payload from client.','AI response JSON/stream depending handler implementation.','Authenticated in non-demo paths; rate-limited.','AI provider, Supabase auth.'),
 '/api/cron/compute-signals':('Cron job computing user signals such as velocity/churn risk.','GET with `Authorization: Bearer ${CRON_SECRET}`.','JSON job summary/errors.','Requires CRON_SECRET bearer token.','Supabase service/admin data writes.'),
 '/api/cron/focus-review-scan':('Cron job generating focus-review queues.','GET with `Authorization: Bearer ${CRON_SECRET}`.','JSON job summary/errors.','Requires CRON_SECRET bearer token.','Focus review generator and Supabase.'),
 '/api/payments/checkout':('Create subscription checkout for pro/prime/institutional.','POST `{ tier }`.','JSON checkout `{ url, id, provider }` or error code.','Requires payments enabled and authenticated user; demo returns local success URL.','Payment provider abstraction; PayRex or LemonSqueezy.'),
 '/api/webhooks/lemonsqueezy':('LemonSqueezy billing webhook.','POST raw body with `x-signature`.','JSON receipt/idempotency/error.','Signature verification; payments flag.','User subscriptions, processed webhook events, analytics/logging.'),
 '/api/webhooks/payrex':('PayRex billing webhook.','POST raw body with `payrex-signature`.','JSON receipt/idempotency/error.','Signature verification; payments flag.','User subscriptions and processed webhook events.'),
 '/auth/callback':('Supabase OAuth/email callback; exchanges code and normalizes `next`.','GET query `code`, `next`, optional UTM/source params.','Redirect to normalized next/dashboard/login error.','Public callback; demo redirects without exchange.','Supabase auth, UTM attribution, analytics event.'),
}
api_rows=[]
for a in inv['apis']:
    m=api_manual.get(a['route'],('Route handler.','See handler.','See handler.','Varies.','See imports.'))
    api_rows.append([a['route'], ', '.join(a['methods']) or '—', f"`{a['file']}`", *m, ', '.join(a.get('env',[])) or '—'])

server_rows=[]
for sf in inv['server_files']:
    if sf['file'].endswith('.test.ts') or sf['file'].endswith('.test.tsx'): continue
    names=sf['exports'] or ['(no named export parsed)']
    domain=sf['file'].replace('src/lib/actions/','').replace('src/lib/queries/','').split('/')[0]
    server_rows.append([f"`{sf['file']}`", domain, ', '.join(f'`{n}`' for n in names[:20]) + (f' (+{len(names)-20})' if len(names)>20 else ''), 'Supabase' if sf.get('uses_supabase') else '—', ', '.join(sf.get('env',[])) or '—'])

features=[
 ['Public marketing landing','Implemented','/; /about; /contact; /pricing; /try','src/app/page.tsx; src/components/landing/; src/components/marketing/','Public product narrative, pricing, contact, and demo/try entry points.','Marketing components, payment flag for pricing','Landing component files are currently being refactored in the working tree; docs reflect current files.'],
 ['Authentication and onboarding','Implemented','/login; /register; /forgot-password; /auth/reset-password; /auth/callback; /onboarding; /onboarding/comp-exam','src/app/(auth)/; src/app/auth/callback/route.ts; src/lib/supabase/middleware.ts; src/lib/actions/profile.ts','Supabase auth flows, reset password, OAuth callback, onboarding profile setup, comp-exam score capture.','Supabase Auth, profiles, user_global_stats','Demo mode redirects auth pages to dashboard.'],
 ['Student dashboard hub','Implemented','/dashboard','src/app/dashboard/page.tsx; src/components/dashboard/; src/lib/actions/dashboard-page.ts','Authenticated study home with progress, readiness, quick actions, and sync payload.','Dashboard actions/queries, Supabase','—'],
 ['Quiz engine v2','Implemented','/quiz; /quiz/[mode]/setup; /quiz/[mode]/session/[sessionId]; /results; /review','src/components/quiz-v2/; src/lib/actions/quiz-v2/; src/stores/useQuizStore.ts','Mode-based setup/session/results/review flow with answer submission, confidence, pause/resume, skip, review data, post-session hooks.','quiz_sessions, user_interactions, questions, user_node_mastery','Large client store remains a complexity risk.'],
 ['Adaptive drills and sessions','Implemented','/dashboard/drills; /dashboard/drills/sessions','src/lib/actions/adaptive-session.ts; src/lib/queries/adaptive-quiz.ts; src/lib/actions/session-actions.ts','Adaptive question selection, session discovery, recent sessions, activity feeds.','questions, user_theta, user_interactions','—'],
 ['Wiki learning system','Implemented','/dashboard/wiki; /dashboard/wiki/[slug]','src/components/wiki/; src/lib/actions/wiki-actions.ts; src/lib/actions/wiki-reads.ts; src/lib/actions/wiki-interactions.ts','Article search/rendering, taxonomy resolution, reads, bookmarks, highlights, feedback, embedded learning interactions.','wiki_articles, wiki_article_taxonomy, taxonomy_tree','—'],
 ['Camp Trails','Implemented','/dashboard/camptrails; /dashboard/camptrails/[slug]; /today; /day/[dayNumber]/complete','src/lib/actions/trails.ts; src/lib/queries/trails.ts; src/components/trails/','Published trails, enrollment, day/step progress, completions.','camp_trails, trail_days, trail_steps, user_trail_enrollments','Legacy /dashboard/trail(s) redirect to CampTrails.'],
 ['3D Lab','Implemented','/dashboard/3d-lab; /dashboard/3d-lab/[moduleId]','src/features/3d-lab/; src/components/r3f/; src/lib/actions/lab.ts','Interactive R3F/WebGL modules, camera/navigation controls, hotspots, onboarding, module registry, performance gates.','React Three Fiber, drei, three, models_3d, spatial_hotspots','Performance-sensitive; many dedicated tests and perf scripts.'],
 ['Area C design practice','Implemented','/dashboard/area-c; /design-problems; /design-quiz; dynamic sessions; /calculator','src/lib/actions/design-problems.ts; src/components/assessment/; src/app/dashboard/area-c/','Design problems, design scenarios, quizzes, and calculator entry.','design_problems, design_scenarios, design_* tables','—'],
 ['Assessment diagnostic','Implemented','/dashboard/assessment','src/lib/actions/assessment.ts; src/components/assessment/','Assessment questions, interaction saving, results, completion status.','anon_diagnostic_sessions, questions, user_interactions','—'],
 ['Readiness and analytics','Implemented','/dashboard/analytics; /dashboard/analytics/advanced; /dashboard/heatmap redirect','src/lib/actions/analytics.ts; src/lib/actions/mastery-actions.ts; src/lib/__tests__/readiness-score.test.ts','Readiness trajectory, heatmaps, pacing, stamina, mastery, memory health.','readiness_score_snapshots, user_global_stats, analytics_events','—'],
 ['SRS and focus review','Implemented','/dashboard/flash; /dashboard/flash/[category]; /dashboard/cram-card; /api/cron/focus-review-scan','src/lib/srs/; src/lib/actions/srs-review.ts; src/lib/focus-review/generate-queue.ts','Spaced repetition cards, review deck, flash categories, focus review queue generation.','user_srs_cards, focus_review_queues','—'],
 ['Notes workspace','Implemented','/dashboard/notes','src/lib/actions/notes-actions.ts; src/hooks/useNoteEditor.ts; src/components/notes/','Rich note list/editor/folders linked to topics/source URLs.','notes, note_folders, TipTap','—'],
 ['Notifications and preferences','Implemented','/dashboard/notifications; /dashboard/settings','src/lib/actions/notifications.ts; src/lib/actions/notification-triggers.ts','Notification listing, mark read/all read, preferences, trigger helpers.','notifications, notification_preferences, notification_log','—'],
 ['Settings, billing, upgrade','Partial','/dashboard/settings; /dashboard/upgrade; /dashboard/settings/billing redirect','src/app/dashboard/settings/; src/app/api/payments/checkout/route.ts; src/lib/payments/','User account/settings and subscription checkout entry.','Payments feature flag, user_subscriptions','Payments are disabled unless NEXT_PUBLIC_PAYMENTS_ENABLED is true; LemonSqueezy checkout path is stubbed.'],
 ['Admin portal','Implemented','/admin plus /admin/*','src/app/admin/; src/components/admin/; src/lib/actions/admin/','Admin dashboard, knowledge/content editor, questions, taxonomy, pipeline, reviews, assets, search, audit, settings, 3D models.','Admin server actions, Supabase, entitlements','Middleware enforces route-specific admin permissions.'],
 ['Developer portal','Implemented','/developer plus /developer/*','src/app/developer/; src/lib/developer/access.ts; src/lib/actions/dev/','Internal API reference, architecture docs, status, console, logs, DB viewer, test data.','Developer entitlement, dev actions','ALLOW_DEV_PORTAL_BYPASS exists for local/dev.'],
 ['CEO portal','Implemented','/ceo plus /ceo/*','src/app/(protected)/ceo/; src/lib/actions/ceo/; src/lib/queries/ceo/','Owner/CEO analytics, financial entries, insights, team, admin role and permission audit.','ceo_* tables, user_roles','Protected by CEO/owner entitlement.'],
 ['Payments and webhooks','Partial','/api/payments/checkout; /api/webhooks/payrex; /api/webhooks/lemonsqueezy','src/lib/payments/provider.ts; src/lib/payrex/config.ts; src/lib/lemonsqueezy/config.ts','Provider abstraction, PayRex checkout, webhook idempotency, subscription updates.','PayRex, LemonSqueezy, user_subscriptions, processed_webhook_events','PayRex primary; LemonSqueezy SDK function intentionally returns null.'],
 ['AI tutor and generation','Experimental','/api/ai/embed; /generate-questions; /socratic; /study-agent; /tutor','src/lib/ai/provider.ts; src/app/api/ai/; src/lib/actions/teach-back.ts','AI completions, embeddings, Socratic tutor, study-agent note tools, teach-back evaluation.','OpenAI, Anthropic, rate limiter','Requires provider keys; production usage not verified from current codebase.'],
 ['Calculators and tools','Implemented','/calculators/*; /tools/*','src/app/calculators/_lib/; src/components/calculators/; src/lib/lot-geometry/','CHB/drywall/flooring/paint/floor tiles/wall paint calculators and lot plotter.','Local calculation engines, lot geometry','Calculator engines have unit tests.'],
 ['Professional/results-day/exam outcome flows','Implemented','/dashboard/professional; /dashboard/results-day; /dashboard/exam-outcome; /dashboard/score-reveal','src/lib/actions/professional-mode.ts; src/lib/actions/results-day.ts; src/app/dashboard/exam-outcome/actions.ts','Professional mode switching, results-day banner/profile, exam-outcome self-report, score reveal.','profiles, exam_outcomes, user_global_stats','—'],
 ['Study pods/social proof','Implemented','/dashboard/pods; /dashboard/pods/[podId]','src/lib/actions/pods.ts; src/lib/actions/social-proof.ts','Pod create/join/leave/data and topic daily-studier social proof.','study_pods, pod_members','—'],
 ['Daily dose / DAE / studio modes','Partial','/dashboard/dae-mode; /dashboard/studio','src/lib/actions/daily-dose/; src/lib/actions/dae-mode.ts; src/lib/actions/studio-mode.ts','Specialized study modes and daily generated activities.','daily_doses, AI/generation helpers','Some flows appear product-specific but not fully verified in UI from current audit.'],
 ['Code updates','Implemented','/dashboard/code-updates','src/lib/actions/code-updates.ts','Lists LEA/code update records and counts.','code_updates','—'],
 ['Admin feature flags/dev overrides','Implemented','/api/admin/flags; developer/admin tooling','src/app/api/admin/flags/route.ts; src/config/feature-flags.ts; src/lib/entitlements/dev-overrides.ts','Runtime feature/dev override cookie for authorized tooling roles.','feature flags config, entitlements audit','HTTP-only cookie with one-week max age.'],
]

feature_rows=features

# env docs
purpose_map={
 'NEXT_PUBLIC_SUPABASE_URL':'Supabase project URL used by browser/server clients and Playwright defaults.',
 'NEXT_PUBLIC_SUPABASE_ANON_KEY':'Supabase anonymous key used by browser/server clients and Playwright defaults.',
 'SUPABASE_SERVICE_ROLE_KEY':'Server-only service-role key for admin clients, scripts, and Supabase checks.',
 'NEXT_PUBLIC_APP_URL':'Public app origin for metadata, redirects, checkout success/cancel URLs, developer layout.',
 'NEXT_PUBLIC_ENABLE_DEMO_MODE':'Client-exposed flag enabling demo/mock Supabase behavior.',
 'NEXT_PUBLIC_PAYMENTS_ENABLED':'Client/server feature flag enabling payment checkout/webhook processing.',
 'PAYMENT_PROVIDER':'Selects payment provider: `payrex` default or `lemonsqueezy`.',
 'PAYREX_SECRET_KEY':'Server-only PayRex API key for checkout creation.',
 'PAYREX_WEBHOOK_SECRET':'Server-only PayRex webhook verification secret.',
 'LEMONSQUEEZY_WEBHOOK_SECRET':'Server-only LemonSqueezy webhook verification secret.',
 'LEMONSQUEEZY_PRO_VARIANT_ID':'LemonSqueezy Pro plan variant ID.',
 'LEMONSQUEEZY_PRIME_VARIANT_ID':'LemonSqueezy Prime plan variant ID.',
 'LEMONSQUEEZY_INSTITUTIONAL_VARIANT_ID':'LemonSqueezy Institutional plan variant ID.',
 'OPENAI_API_KEY':'Server-only OpenAI API key for completions/embeddings and content scripts.',
 'ANTHROPIC_API_KEY':'Server-only Anthropic API key for Claude provider and teach-back actions.',
 'AI_PROVIDER':'AI provider selector: `openai` default or `anthropic`.',
 'AI_COMPLETION_TIMEOUT_MS':'AI completion timeout override.',
 'AI_EMBEDDING_TIMEOUT_MS':'AI embedding timeout override.',
 'AI_STREAM_TIMEOUT_MS':'AI streaming timeout override.',
 'CRON_SECRET':'Bearer token required by cron route handlers.',
 'ADMIN_EMAILS':'Comma-separated fallback emails that resolve to super_admin.',
 'OWNER_EMAILS':'Comma-separated fallback emails that resolve to owner.',
 'DEV_FORCE_USER_ID':'Development-only user impersonation bypass.',
 'DISABLE_DEV_FORCE_USER_ID':'Disables DEV_FORCE_USER_ID in test/CI.',
 'DEV_FORCE_TIER':'Development-only subscription tier override.',
 'ALLOW_DEV_PORTAL_BYPASS':'Development/demo bypass for developer portal access.',
 'NODE_ENV':'Runtime environment branch used by middleware/demo/config/security checks.',
 'CI':'CI flag used by Playwright and perf scripts.',
}

def env_required(name):
    if name in ['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY']: return 'Required for real Supabase mode'
    if name in ['OPENAI_API_KEY','ANTHROPIC_API_KEY']: return 'Required only when selected AI feature/provider is used'
    if name in ['PAYREX_SECRET_KEY','PAYREX_WEBHOOK_SECRET','LEMONSQUEEZY_WEBHOOK_SECRET','LEMONSQUEEZY_PRO_VARIANT_ID','LEMONSQUEEZY_PRIME_VARIANT_ID','LEMONSQUEEZY_INSTITUTIONAL_VARIANT_ID','PAYMENT_PROVIDER','NEXT_PUBLIC_PAYMENTS_ENABLED']: return 'Required only for payments path'
    if name=='CRON_SECRET': return 'Required for cron routes'
    if name.startswith('PLAYWRIGHT') or name.startswith('PERF_') or name.startswith('THREED_') or name in ['CI','PERF_DEV_SERVER_MEMORY_PROFILE','PERF_MEMORY_PROFILE_FILE','PERF_MEMORY_PROFILE_LABEL']: return 'Optional test/performance variable'
    if name.startswith('DEV_') or name.startswith('DISABLE_') or name=='ALLOW_DEV_PORTAL_BYPASS': return 'Optional local/dev variable'
    return 'Optional/feature-specific'

def client_exposed(name): return 'Client-exposed' if name.startswith('NEXT_PUBLIC_') else 'Server/test only'

env_rows=[]
for name,files in sorted(env_inv['code_env'].items()):
    if name=='NEXT_PUBLIC_':
        purpose='Prefix scan in feature-flag helper; not a standalone variable.'
    else:
        purpose=purpose_map.get(name,'Referenced by current code; purpose inferred from file path.')
    env_rows.append([name,purpose,env_required(name),client_exposed(name),rels(files,4),f'{name}=<placeholder>'])
local_only=[]
code_names=set(env_inv['code_env'])
for _, keys in env_inv['local_env_keys'].items():
    for k in keys:
        if k not in code_names:
            local_only.append(k)
local_only=sorted(set(local_only))

# data model rows
data_rows=[]
for t in inv['tables']:
    fields=', '.join(f"`{f['name']}`" for f in t['fields'][:10]) + (f" (+{t['field_count']-10})" if t['field_count']>10 else '')
    data_rows.append([t['name'], str(t['field_count']), fields, 'See `DATABASE_SCHEMA.sql` and migrations.'])

# testing rows
test_rows=[]
for t in inv['tests']:
    if '/support/' in t: continue
    if t.startswith('e2e/'): area='E2E Playwright'
    elif t.startswith('.ai/00_performance'): area='Performance Playwright'
    elif '3d-lab' in t: area='3D Lab'
    elif '/actions/admin/' in t or '/admin/' in t: area='Admin'
    elif '/quiz' in t: area='Quiz'
    elif '/srs/' in t: area='SRS'
    elif '/entitlements/' in t: area='Entitlements/security'
    elif '/api/' in t: area='API/webhook'
    elif '/calculators/' in t or '/lot-geometry/' in t or '/pd1096/' in t: area='Calculators/code logic'
    else: area='Unit/integration'
    test_rows.append([t,area])

# integration rows
integration_rows=[
 ['Supabase','Database/auth/storage client layer','@supabase/supabase-js; @supabase/ssr','src/lib/supabase/; middleware.ts; DATABASE_SCHEMA.sql','NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY','Most authenticated routes, server actions, admin scripts'],
 ['PayRex','Primary checkout/webhook payment provider','payrex-node','src/lib/payrex/config.ts; src/app/api/webhooks/payrex/route.ts; src/app/api/payments/checkout/route.ts','PAYREX_SECRET_KEY, PAYREX_WEBHOOK_SECRET, PAYMENT_PROVIDER','Billing/settings/upgrade'],
 ['LemonSqueezy','Alternative billing integration; webhook exists but client returns null','@lemonsqueezy/lemonsqueezy.js dependency; config stub','src/lib/lemonsqueezy/config.ts; src/app/api/webhooks/lemonsqueezy/route.ts','LEMONSQUEEZY_*','Partial/stubbed billing path'],
 ['OpenAI','Default AI completions and embeddings','openai dependency; direct fetch in provider','src/lib/ai/provider.ts; src/app/api/ai/*; scripts/sanitize-article-refs.ts; scripts/normalize-distractors.ts','OPENAI_API_KEY, AI_PROVIDER, AI_*_TIMEOUT_MS','AI tutor, embeddings, question generation'],
 ['Anthropic','Alternative Claude completion provider and teach-back actions','@anthropic-ai/sdk dependency; direct fetch/provider','src/lib/ai/provider.ts; src/lib/actions/teach-back.ts','ANTHROPIC_API_KEY, AI_PROVIDER','AI tutor/teach-back'],
 ['React Three Fiber / Three.js','Interactive 3D Lab rendering','@react-three/fiber, @react-three/drei, three','src/features/3d-lab/; src/components/r3f/','—','3D Lab'],
 ['TipTap','Rich text editing','@tiptap/*','src/hooks/useNoteEditor.ts; admin/content editor components','—','Notes and admin content editing'],
 ['CodeMirror','Code/markdown editor surfaces','@uiw/react-codemirror, @codemirror/*','developer/admin/editor components','—','Developer/editor surfaces'],
 ['Recharts','Charts and analytics visualization','recharts','src/components/analytics/; CEO/dashboard analytics','—','Analytics dashboards'],
 ['Framer Motion','Animation/motion primitives','framer-motion','components and marketing/UI surfaces','—','UI interactions'],
 ['Storybook','Component development/visual docs','storybook 8.6.17','storybook config; scripts/check-storybook.ts','—','UI governance'],
 ['Playwright','E2E and performance browser automation','@playwright/test','playwright.config.ts; e2e/; .ai/00_performance/playwright/','PLAYWRIGHT_*, PERF_*, THREED_*','QA/performance gates'],
 ['Vercel-compatible cron/hosting','Deployment target inferred from Next/Vercel-style cron scripts and package setup','Next.js runtime','src/app/api/cron/*; next.config.ts','CRON_SECRET','Cron jobs; hosting not verified from deployment config in this audit'],
]

ip_rows=[
 ['ALE taxonomy-linked learning graph','Content system / data model','Connects questions, wiki, trails, mastery and analytics around architecture exam taxonomy.','DATABASE_SCHEMA.sql; src/lib/actions/wiki-actions.ts; src/lib/actions/taxonomy.ts','Wiki, quiz, Camp Trails, mastery','Implemented','IP-relevant as custom ALE content organization; no legal conclusion.'],
 ['Quiz mode and session engine','Training/drill logic','Custom exam-prep modes, session state, confidence/error handling, review/debrief.','src/lib/actions/quiz-v2/; src/stores/useQuizStore.ts; src/lib/quiz/','/quiz/*','Implemented','Large client logic surface.'],
 ['Readiness score / mastery model','Scoring/evaluation logic','Computes readiness, mastery, pacing, stamina, memory health and predictions.','src/lib/__tests__/readiness-score.test.ts; src/lib/actions/analytics.ts; src/lib/actions/mastery-actions.ts','Dashboard analytics','Implemented','Exact scoring formulas should be reviewed in code before external claims.'],
 ['SRS and focus-review queue','Training/drill logic','Spaced repetition and weak-node queue generation for targeted review.','src/lib/srs/; src/lib/focus-review/generate-queue.ts','Flash/cram/focus review','Implemented','Cron-generated focus queues.'],
 ['3D Lab module system','3D/interactive system','Custom R3F module registry, camera controls, hotspots, onboarding, NBCP/stairway calculators.','src/features/3d-lab/','/dashboard/3d-lab/*','Implemented','Strategic interactive learning surface.'],
 ['Wall configurator engine','3D/interactive system','Custom wall assembly/configuration validation engine.','src/features/wall-configurator/','3D/tools integration','Implemented','Covered by engine-validation test.'],
 ['Camp Trails progression','Custom business workflow','Structured multi-day learning paths with step credits and day completions.','src/lib/actions/trails.ts; src/lib/queries/trails.ts; DATABASE_SCHEMA.sql','/dashboard/camptrails/*','Implemented','Custom product flow.'],
 ['Area C design scenarios/problems','Domain-specific logic','Design-problem and scenario tables/actions tuned to architectural design exam prep.','src/lib/actions/design-problems.ts; src/lib/actions/admin/design-scenarios.ts','/dashboard/area-c/*; /admin/knowledge/questions/*','Implemented','Domain-specific ALE practice model.'],
 ['Socratic tutor guardrails','Custom AI workflow','Prompt rules restrict direct answer reveal and enforce guided learning turns/source tags.','src/app/api/ai/socratic/route.ts','AI tutor from quiz feedback','Experimental','Depends on provider keys and rate limits.'],
 ['Study-agent note atomicization','Custom AI workflow','AI summarizes notes, creates flashcard prompts, and checks code-related content.','src/app/api/ai/study-agent/route.ts','Notes/study tooling','Experimental','AI output quality not verified from current tests.'],
 ['Admin content editor/index routing','Custom workflow','Unified content and question editing, import, taxonomy linking, preview/review workflows.','src/components/admin/unified-editor/; src/lib/actions/admin/content.ts','/admin/knowledge/*','Implemented','Operationally strategic content pipeline.'],
 ['Entitlement/role policy model','Data model / access workflow','Canonical roles, admin permissions, subscription tiers, feature flags, dev overrides.','src/lib/entitlements/; src/app/api/admin/flags/route.ts','Admin/developer/CEO/payment-gated features','Implemented','Security-sensitive custom policy layer.'],
 ['CEO internal operating dashboard','Custom business workflow','Financial entries, cash balance, gate status, team metrics, investor export.','src/lib/actions/ceo/; src/lib/queries/ceo/','/ceo/*','Implemented','Internal business intelligence surface.'],
 ['Lot geometry and construction calculators','Domain-specific logic','Material quantity and lot-plotter calculations for architecture/construction study.','src/app/calculators/_lib/; src/lib/lot-geometry/; src/lib/pd1096/','/calculators/*; /tools/*','Implemented','Unit-tested calculation engines.'],
 ['Exam outcome/results-day flows','Custom product workflow','Self-reported outcomes and readiness correlation/score reveal experiences.','src/lib/actions/results-day.ts; src/app/dashboard/exam-outcome/actions.ts','/dashboard/results-day; /dashboard/exam-outcome; /dashboard/score-reveal','Implemented','Privacy-sensitive student outcome data.'],
 ['Performance gate harness for 3D Lab','Automation/script','Custom Playwright/perf scripts for 3D Lab layout/controls/mobile/auth timing gates.','.ai/00_performance/scripts/; .ai/00_performance/playwright/','Performance docs/tests','Implemented','Operational IP-relevant QA harness.'],
]

known_gap_rows=[
 ['Pre-existing dirty working tree','Docs audit found many uncommitted source changes before documentation edits, including 3D Lab/sidebar/landing files and an untracked E2E spec.','High','Do not assume this audit created or validated those source changes; review separately before release.'],
 ['Team runtime could not launch from dirty leader worktree','`omx team` requires clean leader workspace for default worktrees; workaround used a snapshot copy for read-only evidence lanes.','Medium','Avoid team worktree launch until source changes are committed/stashed or use an intentionally copied snapshot for read-only research.'],
 ['LemonSqueezy checkout stub','`getLemonSqueezy()` returns null; webhook exists but operational checkout path unavailable.','Medium','Either complete or remove LemonSqueezy path.'],
 ['No committed `.env.example`','Environment setup is inferred from code and local `.env.local` variable names only.','Medium','Create sanitized `.env.example`.'],
 ['TypeScript strict mode off','`strict`, `noImplicitAny`, and `strictNullChecks` are false.','Medium','Plan phased strictness after MVP stabilization.'],
 ['React Hooks lint rules disabled','Several hooks/react-compiler lint rules are off.','Medium','Re-enable progressively or document accepted risk.'],
 ['No coverage reporter','No Istanbul/c8 coverage config found.','Low','Add coverage when QA strategy requires it.'],
 ['AI production behavior not verified','AI routes exist and are rate-limited, but live provider behavior depends on keys and was not exercised during this docs audit.','Medium','Add integration tests/mocks for AI route contracts.'],
 ['Cron monitoring unclear','Cron routes require CRON_SECRET but alerting/monitoring is not evident from code.','Medium','Add cron failure alerting/observability.'],
 ['Historical `.ai/06_specs/deep` may contain stale strategy/spec claims','Deep docs are preserved history and may conflict with current code.','Medium','Prefer root `.ai/*` current-state docs and mark stale deep specs when encountered.'],
]

# codebase map rows
folder_rows=[]
for fd in inv['feature_dirs']:
    purpose={
      'src/components':'Shared and domain UI components (admin, dashboard, wiki, quiz-v2, sidebar, ui, r3f, etc.)',
      'src/features':'Large feature modules, primarily 3D Lab and wall configurator.',
      'src/lib':'Server actions, queries, auth/entitlements, payments, AI, SRS, analytics, wiki, utilities.',
      'src/hooks':'Reusable React hooks for notes, online status, charts, permissions, gestures and lab telemetry.',
      'src/stores':'Zustand stores for dev controls, notifications, quiz and timer state.',
      'src/config':'Feature flag and portal configuration.',
      'src/data':'Static/local product data and fixtures.',
      'scripts':'Development, build, Playwright, audit, seed and operational scripts.',
      'public':'Static assets served by Next.js.',
    }.get(fd['path'],'Repository area')
    folder_rows.append([fd['path'],str(fd['files']),str(fd['dirs']),purpose, ', '.join(fd['children'][:12]) or '—'])

counts={
 'pages':len(inv['pages']), 'apis':len(inv['apis']), 'layouts':sum(1 for s in inv['special'] if s['kind']=='layout.tsx'),
 'loadings':sum(1 for s in inv['special'] if s['kind']=='loading.tsx'), 'errors':sum(1 for s in inv['special'] if s['kind']=='error.tsx'),
 'server_files':len([x for x in inv['server_files'] if not x['file'].endswith('.test.ts') and not x['file'].endswith('.test.tsx')]),
 'tests':len([x for x in inv['tests'] if re.search(r'(\.test|\.spec)\.', x)]), 'stories':len(inv['stories']), 'tables':len(inv['tables']), 'migrations':len(inv['migrations']),
 'env':len(env_inv['code_env']), 'features':len(feature_rows), 'ip':len(ip_rows)
}

# README
readme=[]
readme.append(f"""# SlateCamp

## Overview

SlateCamp is a **Next.js App Router application for Philippine Architecture Licensure Exam (ALE) preparation**. It serves architecture candidates who need one place for practice tests, taxonomy-linked reference material, 3D/visual learning, study trails, analytics, notes, and admin-managed content operations.

The current app is a **pre-launch MVP**: broad and operationally mature, but still being hardened. The current codebase, not older strategy docs, is the source of truth for this README.

## Current Product Status

- **Status:** Pre-launch MVP.
- **Primary user:** ALE candidate/student.
- **Internal users:** content/admin operators, developers, and owner/CEO operators.
- **Current audited counts ({AUDIT_DATE}):** {counts['pages']} page routes, {counts['apis']} route handlers, {counts['layouts']} layouts, {counts['loadings']} loading states, {counts['errors']} error boundaries, {counts['server_files']} server/action/query files, {counts['tables']} schema tables, {counts['migrations']} migrations, {counts['tests']} test/spec files, {counts['stories']} Storybook stories.
- **Important working-tree note:** this audit started with pre-existing uncommitted source changes. Documentation reflects the files currently present on disk.

## Core Business Features

""")
readme.append(table(['Feature','Status','Routes','Key Files','Description','Dependencies','Notes'], feature_rows))
readme.append("\n## Complete Route Map\n\n")
readme.append(table(['Route','Type','File','Access','Purpose','Key Features','Data/API Dependencies','Notes'], route_rows))
readme.append("\n## API and Server Functionality\n\n### Route handlers\n\n")
readme.append(table(['Endpoint','Methods','File','Purpose','Inputs/Params/Body','Outputs','Auth/Permission','Data/External Services','Env'], api_rows))
readme.append("\n### Server actions / server-side modules\n\nThe exhaustive exported server-action/query inventory is maintained in `.ai/api-and-server.md`. Major server-side areas include quiz/session actions, admin CMS actions, wiki actions, trails, notes, analytics, SRS/focus review, CEO actions, developer/test-data tools, payments/webhooks, Supabase bootstrap, and cron helpers.\n")
readme.append(f"\n## Tech Stack\n\n"+table(['Layer','Technology'],[
 ['Framework','Next.js 16.2.3 App Router'],['UI','React 19.2.5, TypeScript 5.9.3'],['Styling','Tailwind CSS 4.2.4, `DESIGN.md`, `src/app/globals.css`'],['Components','shadcn-style primitives, Radix UI, Base UI, Phosphor/Lucide icons, Framer Motion'],['Database/Auth','Supabase/PostgreSQL, `@supabase/ssr`, Supabase Auth, RLS'],['State','Zustand client stores plus Server Actions/queries'],['3D','React Three Fiber, drei, Three.js'],['Charts/Editors','Recharts, TipTap, CodeMirror, Mermaid'],['Payments','PayRex primary; LemonSqueezy partial/stubbed'],['AI','OpenAI and Anthropic provider abstraction'],['Testing','Bun test runner, Playwright, Storybook'],['Package manager','Bun']]))
readme.append("""
## Architecture Summary

- `middleware.ts` adds `x-pathname`, calls `src/lib/supabase/middleware.ts`, refreshes sessions, applies legacy redirects, and gates admin/developer/CEO routes.
- App routes live in `src/app/`; route groups include `(auth)`, `(protected)`, `admin`, `developer`, `dashboard`, `quiz`, `calculators`, `tools`, `api`.
- Most mutations live in Server Actions under `src/lib/actions/`; reads are split between actions and `src/lib/queries/`.
- Supabase clients are split by execution context: browser (`src/lib/supabase/client.ts`), server (`server.ts`), service role/admin (`admin.ts`), middleware (`middleware.ts`).
- Client-heavy surfaces include 3D Lab, quiz sessions, admin editors, wiki interactions, and notes.
- `next.config.ts` sets security headers, image remote patterns, server action body limit, PayRex externalization, Turbopack root, and route redirects.

## Data Models and Domain Entities

The schema snapshot is `DATABASE_SCHEMA.sql`; migrations live under `supabase/migrations/`. Major entity families include:

""")
readme.append(table(['Domain','Primary tables'],[
 ['Identity/access','profiles, user_roles, user_subscriptions, organizations, organization_members'],['Learning graph/content','disciplines, taxonomy_tree, questions, wiki_articles, wiki_article_taxonomy, wiki_article_sources'],['Quiz/mastery','quiz_sessions, user_interactions, user_question_responses, user_node_mastery, user_mastery_history, user_theta'],['SRS/focus review','user_srs_cards, focus_review_queues, successive_relearning_cycles, confusion_pairs'],['Trails','camp_trails, trail_days, trail_steps, user_trail_enrollments, user_trail_progress, trail_day_completions'],['3D Lab','models_3d, spatial_hotspots'],['Design practice','design_problems, design_questions, design_scenarios, design_scenario_questions, design_*_sessions/interactions'],['Operations','analytics_events, notifications, notification_preferences, processed_webhook_events, feature_flags, code_updates'],['CEO/business','ceo_cash_balance_entries, ceo_financial_entries, ceo_gate_status, ceo_team_members'],['Notes/outcomes','notes, note_folders, exam_outcomes, daily_doses, teach_back_submissions']]))
readme.append("\nSee `.ai/data-models.md` for all tables and representative fields.\n")
readme.append("""
## Authentication and Access Control

- Public routes include `/`, `/about`, `/contact`, `/pricing`, `/try`, auth pages, and `/admin/login`.
- Dashboard, quiz, wiki, notes, 3D Lab, and most student surfaces require authentication outside demo mode.
- Admin routes are gated by canonical roles and route-specific admin permissions in `src/lib/supabase/middleware.ts` and `src/lib/entitlements/policy.ts`.
- Developer routes require the `developerPortal` entitlement via `src/lib/developer/access.ts`.
- CEO routes require the `ceoPortal` entitlement via `src/lib/ceo/access.ts`.
- Role resolution priority: dev force user override, user_roles, profile role, app metadata, user metadata, owner/admin email fallbacks, member/anonymous fallback.
- Dev bypasses (`DEV_FORCE_USER_ID`, `ALLOW_DEV_PORTAL_BYPASS`, `DEV_FORCE_TIER`) are local/test-only risk surfaces and must not be enabled in production.

## Integrations

""")
readme.append(table(['Service/Library','Purpose','Relevant Files','Configuration/Env'], [[r[0],r[1],r[3],r[4]] for r in integration_rows]))
readme.append("""
## UI and Design System

- Design contract: `DESIGN.md`.
- Implemented CSS/Tailwind tokens: `src/app/globals.css`.
- Navigation/sidebar components: `src/components/sidebar/`, `src/components/layout/`, `src/components/portal/`, `src/components/marketing/`.
- UI primitives: `src/components/ui/` with shadcn/Radix-style patterns.
- Product-specific UI: quiz (`src/components/quiz-v2/`), wiki (`src/components/wiki/`), admin (`src/components/admin/`), analytics (`src/components/analytics/`), 3D/R3F (`src/features/3d-lab/`, `src/components/r3f/`).
- Visual principles from `DESIGN.md`: calm study-first UI, Atkinson Hyperlegible/Plus Jakarta/DM Mono typography, Camp Cobalt primary color, semantic success/warning/destructive colors, compact 4px rhythm, restrained elevation, accessible focus states.

## IP-Relevant / Proprietary Implementations

This is an implementation inventory only, not a legal conclusion. See `.ai/ip-inventory.md` for full details.

""")
readme.append(table(['IP-Relevant Item','Category','Status','Key Files','Why It Matters'], [[r[0],r[1],r[5],r[3],r[2]] for r in ip_rows]))
readme.append("""
## Testing and QA

""")
readme.append(table(['Area','Current setup'],[
 ['Unit/integration','Bun test runner; 74 `src/**/*.test.ts(x)` files across quiz, SRS, entitlements, admin, calculators, 3D Lab, middleware, logging.'],['E2E','13 Playwright specs in `e2e/`, plus `e2e/support/authenticated-demo.ts`.'],['Performance browser tests','2 Playwright specs under `.ai/00_performance/playwright/`.'],['Storybook','106 story files; `bun run check:storybook` validates no placeholder story imports.'],['Coverage','No coverage reporter found.'],['Audit verification','This documentation audit ran inventory generation and diff checks; full app tests were not all run because the repo had pre-existing source changes.']]))
readme.append("\nKey commands: `bun run type-check`, `bun run lint`, `bun run test`, `bun run test:e2e:smoke`, `bun run build`, `bun run design:lint`. See `.ai/testing.md` for full test inventory.\n")
readme.append("""
## Development Setup

1. Install dependencies with Bun:

```bash
bun install
```

2. Create `.env.local` with the variables documented below. Do not commit secrets.
3. Start development:

```bash
bun run dev
```

4. Open `http://localhost:3000`.

Local demo mode is available with `NEXT_PUBLIC_ENABLE_DEMO_MODE=true`; real Supabase mode requires Supabase URL/anon/service-role variables.

## Environment Variables

No real secret values are documented here. Example values are placeholders only.

""")
readme.append(table(['Variable','Purpose','Required?','Exposure','Referenced In','Example'], env_rows))
if local_only:
    readme.append('\n### Present in `.env.local` but no current code reference found\n\n')
    readme.append(', '.join(f'`{x}`' for x in local_only)+'. These may be planned, legacy, or external-workflow variables; not verified from current codebase.\n')
readme.append("""
## Available Scripts

""")
import json as _json
pkg=_json.loads(pathlib.Path('package.json').read_text())
script_rows=[[f'`bun run {k}`' if k!='test' else '`bun run test` / `bun test src/`',v] for k,v in pkg['scripts'].items()]
readme.append(table(['Script','Command'], script_rows))
readme.append("""
## Build and Deployment

- Production build: `bun run build` (`bun scripts/next-build.ts`).
- Start built app: `bun run start`.
- Playwright built-app flows use `PLAYWRIGHT_USE_BUILT_APP=true` through scripts.
- Security headers and redirects are configured in `next.config.ts`.
- Vercel-compatible cron behavior is implemented through `/api/cron/*`, but hosting/deployment configuration was not fully verified from current codebase during this audit.

## Known Issues and Gaps

""")
readme.append(table(['Issue/Gaps','Evidence','Severity','Recommended Follow-up'], known_gap_rows))
readme.append("""
## Important Files and Directories

""")
readme.append(table(['Path','Files','Dirs','Purpose','Notable Children'], folder_rows))
readme.append("""
## Documentation / AI Context

Current root `.ai` docs generated/updated by this audit:

- `.ai/project-overview.md`
- `.ai/features.md`
- `.ai/routes.md`
- `.ai/architecture.md`
- `.ai/api-and-server.md`
- `.ai/data-models.md`
- `.ai/ip-inventory.md`
- `.ai/testing.md`
- `.ai/environment.md`
- `.ai/integrations.md`
- `.ai/ui-design-system.md`
- `.ai/security.md`
- `.ai/known-issues.md`
- `.ai/codebase-map.md`
- `.ai/audit-log.md`

## Last Audit

- **Date:** 2026-04-29
- **Scope:** repository-wide documentation audit from current files on disk.
- **Inventories generated:** routes, route handlers, server action/query files, env references, tests, schema tables, migrations, scripts, major folders.
- **Second-pass rule:** documentation was re-scanned against generated inventories before final response.
- **Secrets:** no real secret values were copied; `.env.local` was used only for variable names.
""")
pathlib.Path('README.md').write_text('\n'.join(readme))

# .ai docs
ai=pathlib.Path('.ai'); ai.mkdir(exist_ok=True)

def write(name, content):
    (ai/name).write_text(content.strip()+"\n")

project_overview=f"""
# Project Overview

**Last audit:** {AUDIT_DATE}

SlateCamp is a Next.js App Router application for Philippine Architecture Licensure Exam preparation. It combines public marketing, authenticated student study workflows, admin content operations, developer tooling, and owner/CEO operational dashboards.

## Current audited counts

{table(['Metric','Count'], [[k,str(v)] for k,v in counts.items()])}

## Current status

Pre-launch MVP. The app has broad implemented functionality; remaining risks are mostly hardening, documentation drift, test coverage gaps, payment-provider completeness, and operational monitoring.

## Source-of-truth files

- Routes: `src/app/`
- Server actions: `src/lib/actions/`
- Queries: `src/lib/queries/`
- Schema: `DATABASE_SCHEMA.sql`
- Migrations: `supabase/migrations/`
- Middleware/auth: `middleware.ts`, `src/lib/supabase/middleware.ts`, `src/lib/entitlements/`
- Design: `DESIGN.md`, `src/app/globals.css`
- Commands: `package.json`
- Tests: `src/**/*.test.*`, `e2e/*.spec.ts`, `.ai/00_performance/playwright/*.spec.ts`
"""
write('project-overview.md', project_overview)
write('features.md', f"""
# Feature Inventory

**Last audit:** {AUDIT_DATE}

Status values: Implemented, Partial, Experimental, Deprecated, Unclear.

{table(['Feature','Status','Routes','Key Files','Description','Dependencies','Notes'], feature_rows)}
""")
write('routes.md', f"""
# Complete Route Map

**Last audit:** {AUDIT_DATE}

This table includes every `src/app/**/page.tsx` route discovered on disk. Route groups in parentheses are omitted from URL paths. Dynamic params are shown with bracket syntax.

{table(['Route','Type','File','Access','Purpose','Key Features','Data/API Dependencies','Notes'], route_rows)}

## Route support files

{table(['Kind','Count'], [['layout.tsx',counts['layouts']],['loading.tsx',counts['loadings']],['error.tsx',counts['errors']],['route.ts',counts['apis']]])}

{table(['Kind','Route Scope','File','Access'], [[s['kind'],s['route'],f"`{s['file']}`",s['access']] for s in inv['special']])}
""")
write('api-and-server.md', f"""
# API and Server Functionality

**Last audit:** {AUDIT_DATE}

## Route handlers

{table(['Endpoint','Methods','File','Purpose','Inputs/Params/Body','Outputs','Auth/Permission','Data/External Services','Env'], api_rows)}

## Server actions, server-side query modules, and server-only helpers

The following inventory is generated from files with `'use server'`, files under `src/lib/actions/`, and server/query helper paths. Test files are omitted.

{table(['File','Domain','Exported actions/functions','Supabase?','Env'], server_rows)}

## Auth requirements summary

{table(['Surface','Auth/permission'], [['Public pages','No authentication: `/`, `/about`, `/contact`, `/pricing`, `/try`, auth pages, `/admin/login`.'],['Dashboard/quiz/wiki/student routes','Authenticated outside demo/dev bypass mode.'],['Admin routes','Authenticated and role/permission-gated by `src/lib/supabase/middleware.ts` and `src/lib/entitlements/policy.ts`.'],['Developer routes','Require developer portal entitlement via `src/lib/developer/access.ts`.'],['CEO routes','Require CEO portal entitlement via `src/lib/ceo/access.ts`.'],['Cron API','Require `Authorization: Bearer ${CRON_SECRET}`.'],['Webhook API','Require provider-specific signature headers.'],['AI API','Demo mode allowed; otherwise authenticated and rate-limited.']])}
""")
write('data-models.md', f"""
# Data Models and Domain Entities

**Last audit:** {AUDIT_DATE}

Database truth was taken from `DATABASE_SCHEMA.sql` plus migration file inventory in `supabase/migrations/` ({counts['migrations']} SQL files). This document lists every table parsed from the current schema snapshot and representative fields.

{table(['Table','Field Count','Representative Fields','Relationships / Notes'], data_rows)}

## Model families

- Identity and access: profiles, roles, subscriptions, organizations.
- Learning graph: disciplines, taxonomy tree, taxonomy sources/cross references/prerequisites.
- Content: wiki articles, sources, taxonomy links, bookmarks, reads, feedback, highlights.
- Quiz/mastery: questions, sessions, interactions, responses, mastery, theta, SRS cards.
- Trails: camp trails, days, steps, enrollments, progress, completions.
- 3D Lab: models and spatial hotspots.
- Area C design practice: design problems, design scenarios, sessions, interactions.
- Operations: notifications, analytics events, feature flags, code updates, webhook events.
- CEO/business: financial entries, cash balances, gates, team members.
""")
write('ip-inventory.md', f"""
# IP-Relevant / Proprietary Implementation Inventory

**Last audit:** {AUDIT_DATE}

This is an implementation inventory, not legal advice and not a claim of patent/copyright/trademark protection.

{table(['IP-Relevant Item','Category','Why It Matters','Key Files','Related Features/Routes','Status','Notes'], ip_rows)}
""")
write('testing.md', f"""
# Testing and QA

**Last audit:** {AUDIT_DATE}

## Testing stack

- Bun native test runner for unit/integration tests.
- Playwright for e2e and performance browser tests.
- Storybook for component previews; `check:storybook` prevents placeholder stories.
- No coverage reporter was found.

## Test commands

{table(['Command','Purpose'], [[f'`bun run {k}`',v] for k,v in pkg['scripts'].items() if k=='test' or k.startswith('test') or k.startswith('perf') or k in ['type-check','lint','build','design:lint','check:storybook','validate:release']])}

## Test file inventory

{table(['Test File','Area'], test_rows)}

## Coverage areas

- Strong: SRS, quiz helpers/actions, entitlement/role logic, calculators, 3D Lab registry/stores/geometry, admin actions, payment route/webhook contracts, middleware auth behavior.
- E2E: public smoke, access boundaries, authenticated demo, learning/wiki, portals, 3D Lab, restricted/admin-permission roles, CEO portal, sidebar navigation.
- Performance: `.ai/00_performance/playwright/` and scripts cover frontend/perf/3D gates.

## Gaps

- No coverage reporter.
- Full release test suite was not run during this documentation-only audit because the repository began with pre-existing source changes.
- AI provider live behavior and cron job monitoring were not verified from current tests.
""")
write('environment.md', f"""
# Environment and Configuration

**Last audit:** {AUDIT_DATE}

No secret values are included. `.env.local` was read only for variable names.

{table(['Variable','Purpose','Required?','Exposure','Referenced In','Example'], env_rows)}

## Present in `.env.local` but no current code reference found

{', '.join(f'`{x}`' for x in local_only) if local_only else 'None found.'}

## Configuration files

{table(['File','Purpose'], [['package.json','Scripts and dependency truth.'],['next.config.ts','Next headers, redirects, images, server action body size, PayRex external package, Turbopack root.'],['middleware.ts','Global middleware wrapper adding x-pathname and preserving Supabase cookies.'],['src/lib/supabase/middleware.ts','Auth/session refresh, demo mode, legacy redirects, admin/developer/CEO gating.'],['tsconfig.json','TypeScript config; strict mode currently off.'],['eslint.config.mjs','ESLint/Next rules; many hooks rules disabled.'],['playwright.config.ts','E2E projects, web server, demo-auth environment.'],['DESIGN.md','Agent-readable design token contract.'],['src/app/globals.css','Implemented CSS/Tailwind tokens.']])}
""")
write('integrations.md', f"""
# Integrations

**Last audit:** {AUDIT_DATE}

{table(['Service/Library','Purpose in App','Package/Library','Relevant Files','Configuration/Env','Dependent Routes/Features'], integration_rows)}

## Not verified from current codebase

- Production hosting provider/deploy settings beyond Next/Vercel-compatible patterns.
- Live external service credentials or availability.
- Stripe, PostHog, Resend, and Google Cloud are present as local env names or historical docs but no current implementation was found in code.
""")
write('ui-design-system.md', f"""
# UI and Design System

**Last audit:** {AUDIT_DATE}

## Sources of truth

- `DESIGN.md` — agent-readable visual identity and design-token contract.
- `src/app/globals.css` — implemented CSS custom properties and Tailwind CSS 4 tokens.
- `src/components/ui/` — shared primitives.
- `src/components/sidebar/`, `src/components/layout/`, `src/components/portal/`, `src/components/marketing/` — navigation and shell surfaces.
- `src/features/3d-lab/` and `src/components/r3f/` — 3D/R3F visual system.

## Current design contract

- Study-first, calm, work-focused ALE prep interface.
- Camp Cobalt primary (`#1B3FC4`), Ink foreground (`#1A2332`), semantic success/warning/destructive colors, Camp Orange sparingly for warm CTA, Trail Accent for Camp Trails.
- Atkinson Hyperlegible body/UI text, Plus Jakarta Sans headings, DM Mono for code/numeric/technical references.
- Compact 4px rhythm; common gaps 8/16/24px; no nested card stacks as a default pattern.
- Restrained borders/elevation; stronger shadows reserved for temporary elevation.
- `design:lint` validates `DESIGN.md`.

## Major UI surfaces

{table(['Surface','Files','Notes'], [['Marketing/landing','src/components/landing/; src/components/marketing/','Current landing components are being refactored in working tree.'],['Dashboard shell/sidebar','src/components/sidebar/; src/components/layout/; src/app/dashboard/layout.tsx','Main authenticated navigation.'],['Admin portal','src/components/admin/; src/app/admin/','Content/editor/admin operations.'],['Quiz UI','src/components/quiz-v2/; src/stores/useQuizStore.ts','Real-time quiz interaction.'],['Wiki UI','src/components/wiki/','Article navigation/rendering/interactive blocks.'],['3D Lab UI','src/features/3d-lab/; src/components/r3f/','WebGL canvas, controls, panels, hotspots.'],['Analytics','src/components/analytics/','Charts and metrics.'],['Notes','src/components/notes/; src/hooks/useNoteEditor.ts','TipTap rich text note editing.']])}
""")
write('security.md', f"""
# Security, Privacy, and Access Control

**Last audit:** {AUDIT_DATE}

## Auth/session architecture

- Supabase Auth via `@supabase/ssr`.
- `middleware.ts` delegates to `src/lib/supabase/middleware.ts` and preserves cookies.
- `src/lib/supabase/server.ts`, `client.ts`, `admin.ts` separate server/browser/service-role contexts.
- Demo mode can use a mock Supabase client when `NEXT_PUBLIC_ENABLE_DEMO_MODE=true` or production keys are missing outside development.

## Role and permission system

- Canonical roles: anonymous, member, super_admin, content_admin, sme_reviewer, developer, admin, ceo, owner (`src/lib/entitlements/types.ts`).
- Role sources: app metadata, user metadata, profiles.role, user_roles, admin/owner email fallback, dev force user.
- Admin route permissions are mapped in `src/lib/supabase/middleware.ts`.
- Feature access decisions live in `src/lib/entitlements/get-viewer-entitlements.ts`, `policy.ts`, `feature-keys.ts`, and dev overrides.

## Protected surfaces

{table(['Surface','Protection'], [['/admin/*','Authenticated + admin portal role + route-specific admin permission.'],['/developer/*','Developer entitlement; local bypass possible only when configured.'],['/ceo/*','CEO/owner entitlement.'],['/dashboard/* and /quiz/*','Authenticated outside demo/dev bypass mode.'],['/api/cron/*','CRON_SECRET bearer token.'],['/api/webhooks/*','Provider signature header + payments flag.'],['/api/ai/*','Demo allowed; otherwise authenticated and rate-limited.']])}

## Security headers

Configured in `next.config.ts`: X-Frame-Options SAMEORIGIN, nosniff, strict-origin-when-cross-origin referrer policy, HSTS, Permissions-Policy denying camera/microphone/geolocation, and a CSP allowing self, inline/eval scripts/styles, Supabase, Google avatar images, Anthropic connect, and blob workers.

## Privacy-relevant data

Profiles, subscriptions, quiz interactions, exam outcomes, notes, analytics events, notifications, financial/CEO entries, and AI prompts/responses are privacy-relevant. No secret values are documented in repo docs.

## Concerns

- `DEV_FORCE_USER_ID`, `DEV_FORCE_TIER`, and `ALLOW_DEV_PORTAL_BYPASS` are powerful local overrides.
- TypeScript strict mode and hooks lint rules are off.
- Cron monitoring and AI production behavior are not verified from current codebase.
""")
write('known-issues.md', f"""
# Known Issues and Gaps

**Last audit:** {AUDIT_DATE}

{table(['Issue/Gaps','Evidence','Severity','Recommended Follow-up'], known_gap_rows)}
""")
write('codebase-map.md', f"""
# Codebase Map

**Last audit:** {AUDIT_DATE}

## Root-level and important directories

{table(['Path','Files','Dirs','Purpose','Notable Children'], folder_rows + [['src/app',str(len(inv['pages'])+len(inv['apis'])+len(inv['special'])),'—','Next.js App Router pages, route handlers, layouts/loading/error boundaries.','admin, api, dashboard, developer, quiz, calculators, tools'],['supabase',str(len(inv['migrations']))+' migrations','—','Database migrations and inspection/reset scripts.','migrations, check_db*.ts, seed/reset SQL'],['.ai','many','—','Operational intelligence, audits, plans, performance docs, current AI context.','00_system, 00_performance, 02_audits, 06_specs, 10_state'],['docs','—','—','Root-level bridge/pointer docs.','README.md and docs subtree'],['e2e',str(sum(1 for t in inv['tests'] if t.startswith('e2e/') and '.spec.' in t)),'—','Playwright e2e tests and support fixtures.','support/authenticated-demo.ts']])}

## Ignore/generated/vendor folders

Ignore `node_modules/`, `.next/`, `dist/`, `build/`, coverage output, cache folders, and generated runtime state unless a task explicitly targets tooling/runtime.

## Where future agents should look

{table(['Task','Start Here'], [['Route behavior','`src/app/<route>/page.tsx` plus local `AGENTS.md`, loading/error/layout files.'],['Auth/access','`middleware.ts`, `src/lib/supabase/middleware.ts`, `src/lib/entitlements/`.'],['Database claims','`DATABASE_SCHEMA.sql` then `supabase/migrations/`.'],['Server mutation','`src/lib/actions/<domain>/`.'],['Data reads','`src/lib/queries/` and route-level server components.'],['Design/UI','`DESIGN.md`, `src/app/globals.css`, `src/components/ui/`, nearest component subtree.'],['3D Lab','`src/features/3d-lab/` plus 3D skills/docs.'],['Tests','`package.json`, `src/**/*.test.*`, `e2e/*.spec.ts`, `.ai/00_performance/`.']])}
""")
write('audit-log.md', f"""
# Audit Log — Codebase Documentation Sync

**Audit date:** {AUDIT_DATE}

## Summary of what was inspected

- Root docs and `.ai/` docs.
- `package.json`, Next/TS/ESLint/Playwright config, middleware, design files.
- `src/app/**` page routes, route handlers, layouts/loading/error files.
- `src/lib/actions/**`, `src/lib/queries/**`, Supabase clients, entitlements/auth/security files.
- `DATABASE_SCHEMA.sql` and `supabase/migrations/` inventory.
- `src/components/`, `src/features/`, `src/hooks/`, `src/stores/`, `src/config/`, `scripts/`, `public/` high-level inventories.
- Tests in `src/`, `e2e/`, and `.ai/00_performance/playwright/`.
- Environment variable references in current code/script files and variable names in `.env.local`.

## Documentation files updated

README.md; .ai/README.md; .ai/project-overview.md; .ai/app-audit.md; .ai/features.md; .ai/routes.md; .ai/architecture.md; .ai/api-and-server.md; .ai/api-surface.md; .ai/data-models.md; .ai/data-model.md; .ai/ip-inventory.md; .ai/testing.md; .ai/testing-and-quality.md; .ai/developer-workflow.md; .ai/environment.md; .ai/integrations.md; .ai/ui-design-system.md; .ai/security.md; .ai/known-issues.md; .ai/known-gaps.md; .ai/codebase-map.md; .ai/audit-log.md.

## Counts

{table(['Item','Count'], [['Routes documented',counts['pages']],['API route handlers documented',counts['apis']],['Server/action/query files documented',counts['server_files']],['Features documented',counts['features']],['IP-relevant items documented',counts['ip']],['Test/spec files documented',counts['tests']],['Story files inventoried',counts['stories']],['Environment variables referenced in code/scripts documented',counts['env']],['Schema tables documented',counts['tables']],['Migration files counted',counts['migrations']]])}

## Commands run

- `pwd && tmux -V && git status --short`
- `cat package.json`
- `find` inventories for AGENTS/docs/config/app/API/test files
- Python inventory generation into `.omx/audit/inventory.json`
- Python env inventory generation into `.omx/audit/env-inventory.json`
- `sed` inspections of middleware, Supabase/auth/entitlement files, config files, design files, route handlers
- `omx team ...` attempted from leader and then launched from a copied snapshot for read-only evidence lanes because the leader worktree was dirty

## Commands that failed or could not be completed

- Initial `omx team` launch from `/Users/philiplewis/slatecamp` failed with `leader_workspace_dirty_for_worktrees` because the repository had pre-existing uncommitted source changes.
- Full release/test/build suite was not run during this documentation-only audit; current source worktree was already dirty and includes unrelated implementation changes.

## Major discoveries

- Current page route count is {counts['pages']}, not older documented 125/112 counts.
- Current route handler count is {counts['apis']}.
- Current schema parse found {counts['tables']} tables in `DATABASE_SCHEMA.sql` and {counts['migrations']} migration SQL files.
- `.env.local` contains variable names not referenced by current code (not secrets copied): {', '.join(local_only) if local_only else 'none'}.
- LemonSqueezy config remains stubbed (`getLemonSqueezy()` returns null) despite webhook route/package presence.

## Known uncertainties

- Live external services and real credentials were not tested.
- Production hosting/deployment provider was not fully verified from repository config.
- Historical `.ai/06_specs/deep` docs may contain stale claims and should be treated as reference history unless re-verified.
- Pre-existing uncommitted source changes should be reviewed separately.

## Follow-up recommendations

- Commit or stash current implementation changes, then run `bun run type-check`, `bun run lint`, `bun run test`, `bun run build`, and selected Playwright suites.
- Add sanitized `.env.example`.
- Decide whether to complete or remove LemonSqueezy/Stripe/PostHog/Resend/Google Cloud references.
- Add coverage tooling and cron/AI integration tests.
""")
# architecture, developer-workflow, app-audit, aliases
write('architecture.md', f"""
# Architecture

**Last audit:** {AUDIT_DATE}

## System overview

SlateCamp is a Next.js 16 App Router app with Supabase-backed auth/data, Server Actions for most mutations, API route handlers for AI/payments/cron/webhooks, and client-heavy interactive surfaces for quiz, 3D Lab, wiki, notes, and admin editors.

## Current structure

{table(['Layer','Files/Paths','Role'], [['App router','src/app/','Pages, route groups, layouts, loading/error boundaries, route handlers.'],['Components','src/components/','Shared and domain UI components.'],['Features','src/features/','Large modules: 3D Lab and wall configurator.'],['Server logic','src/lib/actions/; src/lib/queries/; src/lib/supabase/','Mutations, reads, auth/data clients, server helpers.'],['State','src/stores/; src/hooks/','Zustand stores and reusable client hooks.'],['Database','DATABASE_SCHEMA.sql; supabase/migrations/','Schema snapshot and migration chronology.'],['Docs/ops','.ai/; docs/; AGENTS.md hierarchy','Operational intelligence and agent guidance.']])}

## Request flow

1. `middleware.ts` sets `x-pathname` and delegates to `src/lib/supabase/middleware.ts`.
2. Supabase middleware handles static/API bypass, legacy redirects, local dev force-user bypass, public path checks, demo mode, session refresh, and privileged route gating.
3. Route layouts/pages render Server Components by default and mount Client Components where interactivity is needed.
4. Server Actions/queries in `src/lib/` read/write Supabase.
5. Route handlers in `src/app/api/` handle AI, cron, payments, webhooks, and admin flag overrides.

## Rendering/client boundaries

Server-first intent, but many files are client components due to 3D rendering, quiz timers/state, rich editors, navigation, wiki interactions, and notes.

## Caching/revalidation/error handling

- Next route loading/error files are widely present: {counts['loadings']} loading files and {counts['errors']} error boundaries.
- Server actions use `revalidatePath`/cache tags in selected domains (`src/lib/actions/cache-tags.ts`).
- Payment webhooks use `processed_webhook_events` for idempotency.
- AI routes use rate limiting and timeout signals.

See `routes.md`, `api-and-server.md`, `security.md`, and `codebase-map.md` for detailed inventories.
""")
write('developer-workflow.md', f"""
# Developer Workflow

**Last audit:** {AUDIT_DATE}

## Package manager

Use Bun. Commands are defined in `package.json`.

## Setup

```bash
bun install
cp .env.example .env.local # not currently available; create .env.local manually from environment.md
bun run dev
```

## Core commands

{table(['Command','Purpose'], script_rows)}

## Verification guidance

- Documentation-only changes: `git diff --check` plus path/reference checks.
- Source behavior changes: `bun run type-check`, `bun run lint`, targeted `bun test ...`, relevant Playwright suite.
- Design-token changes: `bun run design:lint`.
- Release gate: `bun run validate:release`.

## Caveats

- No committed `.env.example` exists.
- TypeScript strict mode is off.
- Hooks lint rules are disabled.
- Current audit began with pre-existing uncommitted implementation changes.
""")
write('app-audit.md', f"""
# App Audit

**Audit date:** {AUDIT_DATE}

## Executive summary

SlateCamp is a broad pre-launch MVP for ALE preparation with implemented student, admin, developer, CEO, AI, 3D, payment, and operational surfaces. The app is substantial enough that documentation drift is a product risk; this audit refreshed root README and `.ai` current-state docs from the live codebase.

## Verified metrics

{table(['Metric','Count'], [[k,str(v)] for k,v in counts.items()])}

## Current strengths

- Full App Router surface with {counts['pages']} pages and {counts['apis']} route handlers.
- Rich domain model around taxonomy, quiz/mastery, wiki, SRS, trails, 3D Lab, Area C design practice, notes, notifications, and CEO operations.
- Meaningful automated tests across src, e2e, and performance harnesses.
- Centralized entitlement/role policy layer and route-specific admin permission mapping.
- Explicit design contract in `DESIGN.md`.

## Current risks

{table(['Risk','Evidence','Severity','Follow-up'], known_gap_rows)}

## Evidence docs

- `routes.md`
- `features.md`
- `api-and-server.md`
- `data-models.md`
- `testing.md`
- `environment.md`
- `security.md`
- `audit-log.md`
""")
# Alias legacy names to current docs with enough content
write('api-surface.md', "# API Surface\n\nThis file is retained for compatibility. Current API/server truth is in [`api-and-server.md`](api-and-server.md).\n\n" + (ai/'api-and-server.md').read_text())
write('data-model.md', "# Data Model\n\nThis file is retained for compatibility. Current data-model truth is in [`data-models.md`](data-models.md).\n\n" + (ai/'data-models.md').read_text())
write('testing-and-quality.md', "# Testing and Quality\n\nThis file is retained for compatibility. Current testing truth is in [`testing.md`](testing.md).\n\n" + (ai/'testing.md').read_text())
write('known-gaps.md', "# Known Gaps\n\nThis file is retained for compatibility. Current known-issues truth is in [`known-issues.md`](known-issues.md).\n\n" + (ai/'known-issues.md').read_text())
# README for .ai
write('README.md', f"""
# `.ai` Operational Intelligence Workspace

This `.ai` directory is SlateCamp's operational intelligence layer. Root-level files below are current-state docs refreshed from the live codebase on {AUDIT_DATE}. Numbered folders preserve operational logs, plans, audits, specs, performance work, and historical context.

## Current root docs

{table(['Document','Purpose'], [['project-overview.md','Current app overview and audited counts.'],['app-audit.md','Executive audit summary and risk snapshot.'],['features.md','Implemented/partial/experimental feature inventory.'],['routes.md','Complete App Router page/support-file route map.'],['architecture.md','Architecture, request flow, boundaries, and patterns.'],['api-and-server.md','API route handlers and server action/query inventory.'],['data-models.md','Schema table/entity inventory from DATABASE_SCHEMA.sql.'],['ip-inventory.md','IP-relevant implementation inventory without legal conclusions.'],['testing.md','Testing stack, commands, and test file inventory.'],['environment.md','Environment variable inventory without secret values.'],['integrations.md','External service/library integration inventory.'],['ui-design-system.md','Design-system and UI architecture notes.'],['security.md','Auth, access control, privacy, and security notes.'],['known-issues.md','Current gaps, risks, and follow-ups.'],['codebase-map.md','Folder/file map for future agents.'],['audit-log.md','Audit date, commands, counts, uncertainties, and follow-ups.']])}

## Compatibility docs

`api-surface.md`, `data-model.md`, `testing-and-quality.md`, and `known-gaps.md` are retained as compatibility mirrors that point to the refreshed canonical files above.

## Numbered taxonomy

Use `.ai/00_system/ai-folder-canonical-map.md` for historical routing. Treat `.ai/06_specs/deep/` as deep reference/history unless a claim has been re-verified against current code.

## Rules

- Codebase is source of truth.
- Do not copy secrets into docs.
- Date time-sensitive counts and validation claims.
- Update root README and relevant `.ai` docs together when product/architecture/routes change.
""")
print('wrote docs', counts)
