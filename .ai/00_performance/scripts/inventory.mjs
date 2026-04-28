import path from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { ensurePerfDirs, repoPath, RESULTS_DIR, rel, routeFromAppFile, safeJsonFile, walk, writeMarkdown } from './perf-utils.mjs'

ensurePerfDirs()
const packageJson = JSON.parse(readFileSync(repoPath('package.json'), 'utf8'))
const deps = { ...(packageJson.dependencies ?? {}), ...(packageJson.devDependencies ?? {}) }
const has = (name) => Object.hasOwn(deps, name)
const tools = ['@playwright/test', 'cypress', 'vitest', 'jest', 'lighthouse', 'web-vitals', 'k6', 'autocannon', 'clinic', '@next/bundle-analyzer', 'webpack-bundle-analyzer', 'react-scan']
  .map((name) => ({ name, installed: has(name), version: deps[name] ?? null }))

const appFiles = walk(repoPath('src/app'), { include: (file) => /\/(page|layout|loading|error|not-found|route)\.(tsx|ts|js|jsx)$/.test(file) })
const pages = appFiles.filter((file) => /\/page\.(tsx|ts|js|jsx)$/.test(file)).map((file) => ({ path: routeFromAppFile(file), file: rel(file) })).sort((a, b) => a.path.localeCompare(b.path))
const layouts = appFiles.filter((file) => /\/layout\.(tsx|ts|js|jsx)$/.test(file)).map((file) => ({ path: routeFromAppFile(file), file: rel(file) }))
const loading = appFiles.filter((file) => /\/loading\.(tsx|ts|js|jsx)$/.test(file)).map((file) => ({ path: routeFromAppFile(file), file: rel(file) }))
const errors = appFiles.filter((file) => /\/error\.(tsx|ts|js|jsx)$/.test(file)).map((file) => ({ path: routeFromAppFile(file), file: rel(file) }))
const routeHandlers = appFiles.filter((file) => /\/route\.(ts|js)$/.test(file)).map((file) => {
  const text = readFileSync(file, 'utf8')
  const methods = [...text.matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/g)].map((m) => m[1])
  return {
    path: routeFromAppFile(file),
    file: rel(file),
    methods,
    runtime: text.match(/export\s+const\s+runtime\s*=\s*['"]([^'"]+)/)?.[1] ?? null,
    dynamic: text.match(/export\s+const\s+dynamic\s*=\s*['"]([^'"]+)/)?.[1] ?? null,
    usesSupabase: /supabase|createClient|createServerClient|createBrowserClient/.test(text),
    usesAuth: /\.auth\.|getUser\(|getSession\(|require[A-Z][A-Za-z]*Auth|requireUser/.test(text),
    usesExternalFetch: /fetch\(/.test(text),
  }
}).sort((a, b) => a.path.localeCompare(b.path))

const sourceFiles = walk(repoPath('src'), { include: (file) => /\.(ts|tsx|js|jsx)$/.test(file) })
const dataFetching = []
const caching = []
const clientComponents = []
const serverActions = []
for (const file of sourceFiles) {
  const text = readFileSync(file, 'utf8')
  const fileRel = rel(file)
  if (/['"]use client['"]/.test(text.slice(0, 200))) clientComponents.push(fileRel)
  if (/['"]use server['"]/.test(text.slice(0, 500)) || /\/actions\//.test(fileRel)) serverActions.push(fileRel)
  const flags = []
  if (/\bfetch\(/.test(text)) flags.push('fetch')
  if (/createClient\(|createServerClient\(|createBrowserClient\(/.test(text)) flags.push('supabase-client')
  if (/\.from\(|\.rpc\(|\.auth\.|\.storage/.test(text)) flags.push('supabase-call')
  if (/cookies\(|headers\(/.test(text)) flags.push('request-bound-server-api')
  if (/await\s+Promise\.all|Promise\.all\(/.test(text)) flags.push('parallel-fetching')
  if (flags.length) dataFetching.push({ file: fileRel, flags })
  const cacheFlags = []
  if (/unstable_cache|\bcache\(/.test(text)) cacheFlags.push('server-cache-helper')
  if (/revalidate(Path|Tag)?\(|export\s+const\s+revalidate\s*=|next:\s*\{\s*revalidate/.test(text)) cacheFlags.push('revalidation')
  if (/cache:\s*['"](?:force-cache|no-store)/.test(text)) cacheFlags.push('fetch-cache-directive')
  if (/localStorage|sessionStorage|indexedDB|\bidb\b/.test(text)) cacheFlags.push('browser-storage-cache-or-state')
  if (cacheFlags.length) caching.push({ file: fileRel, flags: cacheFlags })
}

const e2eSpecs = walk(repoPath('e2e'), { include: (file) => /\.spec\.ts$/.test(file) }).map((file) => rel(file)).sort()
const scripts = packageJson.scripts ?? {}
const publicRoutes = pages.filter((page) => /^\/(login|register|forgot-password|auth\/reset-password|pricing|about|contact|try)?$/.test(page.path)).map((page) => page.path)
const dashboardRoutes = pages.filter((page) => page.path.startsWith('/dashboard')).map((page) => page.path)
const adminRoutes = pages.filter((page) => page.path.startsWith('/admin')).map((page) => page.path)
const developerRoutes = pages.filter((page) => page.path.startsWith('/developer')).map((page) => page.path)
const quizRoutes = pages.filter((page) => page.path.startsWith('/quiz')).map((page) => page.path)

const inventory = {
  timestamp: new Date().toISOString(),
  frameworkAndRuntime: {
    next: deps.next ?? null,
    react: deps.react ?? null,
    nodeType: 'Next.js App Router application; Bun script runner/package manager; Node-compatible runtime.',
    packageManager: existsSync(repoPath('bun.lock')) ? 'bun' : 'unknown',
  },
  packageScripts: scripts,
  installedPerformanceTools: tools,
  testFrameworks: {
    playwright: has('@playwright/test'),
    cypress: has('cypress'),
    vitest: has('vitest'),
    jest: has('jest'),
    eslint: has('eslint'),
    typescript: has('typescript'),
  },
  routes: { pages, layouts, loading, errors, routeHandlers },
  counts: {
    pages: pages.length,
    layouts: layouts.length,
    loading: loading.length,
    errors: errors.length,
    routeHandlers: routeHandlers.length,
    clientComponents: clientComponents.length,
    serverActionLikeFiles: serverActions.length,
    sourceFiles: sourceFiles.length,
  },
  routeGroups: { publicRoutes, dashboardRoutes, adminRoutes, developerRoutes, quizRoutes },
  e2eSpecs,
  dataFetchingArchitecture: {
    dataFetchingFiles: dataFetching,
    cachingFiles: caching,
    clientComponents,
    serverActions,
    hasReactQuery: has('@tanstack/react-query'),
    hasSWR: has('swr'),
    hasZustand: has('zustand'),
  },
  knownUserJourneyCandidates: [
    { name: 'landing/startup', paths: ['/', '/try'] },
    { name: 'login/signup/recovery', paths: ['/login', '/register', '/forgot-password', '/auth/reset-password'] },
    { name: 'dashboard/home', paths: ['/dashboard'] },
    { name: 'learning/wiki', paths: dashboardRoutes.filter((route) => route.includes('wiki')).slice(0, 12) },
    { name: 'quiz/session', paths: quizRoutes.slice(0, 12) },
    { name: '3d lab', paths: dashboardRoutes.filter((route) => route.includes('3d') || route.includes('lab')).slice(0, 12) },
    { name: 'admin/content', paths: adminRoutes.slice(0, 20) },
    { name: 'developer/internal', paths: developerRoutes.slice(0, 20) },
  ],
}

safeJsonFile(path.join(RESULTS_DIR, 'inventory.json'), inventory)
safeJsonFile(path.join(RESULTS_DIR, 'route_inventory.json'), inventory.routes)
safeJsonFile(path.join(RESULTS_DIR, 'frontend_route_targets.json'), {
  public: publicRoutes,
  authenticatedDemo: ['/dashboard', '/dashboard/settings', '/dashboard/wiki', '/dashboard/analytics', '/dashboard/3d-lab'].filter((route) => pages.some((page) => page.path === route)),
  apiGet: routeHandlers.filter((handler) => handler.methods.includes('GET') && !handler.path.includes(':')).map((handler) => handler.path),
})

const toolRows = tools.map((tool) => `| ${tool.name} | ${tool.installed ? 'yes' : 'no'} | ${tool.version ?? ''} |`).join('\n')
const scriptRows = Object.entries(scripts).map(([name, command]) => `| \`${name}\` | \`${String(command).replace(/\|/g, '\\|')}\` |`).join('\n')
const routeHandlerRows = routeHandlers.map((handler) => `| \`${handler.path}\` | ${handler.methods.join(', ') || 'none exported'} | \`${handler.file}\` | ${handler.usesSupabase ? 'yes' : 'no'} | ${handler.usesAuth ? 'yes' : 'no'} |`).join('\n')
const journeyRows = inventory.knownUserJourneyCandidates.map((journey) => `| ${journey.name} | ${journey.paths.map((p) => `\`${p}\``).join(', ') || 'blocked/not present'} |`).join('\n')

writeMarkdown(path.join(process.cwd(), '.ai/00_performance/00_inventory.md'), `# 00 — Repository Performance Inventory

Generated: ${inventory.timestamp}

## App framework and runtime
- Framework: Next.js ${deps.next ?? 'unknown'} App Router.
- React: ${deps.react ?? 'unknown'}.
- Runtime/package runner: Bun (${existsSync(repoPath('bun.lock')) ? '`bun.lock` present' : 'lockfile not detected'}).
- Next config: \`next.config.ts\` defines security headers, redirects, image remote patterns, server action body limit, and \`payrex-node\` as a server external package.
- Middleware: \`middleware.ts\` calls Supabase session refresh via \`updateSession(request)\` on all non-static/image paths, then forwards an \`x-pathname\` request header.

## Package manager and scripts
| Script | Command |
| --- | --- |
${scriptRows}

## Installed test/performance tooling
| Tool | Installed | Version |
| --- | --- | --- |
${toolRows}

## Existing test framework signals
- Playwright config exists at \`playwright.config.ts\` and E2E specs exist under \`e2e/\`.
- TypeScript validation is wrapped by \`bun scripts/type-check.ts\`.
- ESLint is available via \`bun run lint\`.
- Storybook validation is part of lint and storybook scripts.

## Frontend route/page inventory
- Page routes: ${pages.length}
- Layout files: ${layouts.length}
- Loading states: ${loading.length}
- Error boundaries: ${errors.length}

### Route groups by user-facing surface
- Public route candidates (${publicRoutes.length}): ${publicRoutes.map((route) => `\`${route}\``).join(', ') || 'none detected'}
- Dashboard route candidates (${dashboardRoutes.length}): ${dashboardRoutes.slice(0, 50).map((route) => `\`${route}\``).join(', ')}${dashboardRoutes.length > 50 ? ', ...' : ''}
- Admin route candidates (${adminRoutes.length}): ${adminRoutes.slice(0, 50).map((route) => `\`${route}\``).join(', ')}${adminRoutes.length > 50 ? ', ...' : ''}
- Developer route candidates (${developerRoutes.length}): ${developerRoutes.slice(0, 50).map((route) => `\`${route}\``).join(', ')}${developerRoutes.length > 50 ? ', ...' : ''}
- Quiz route candidates (${quizRoutes.length}): ${quizRoutes.slice(0, 50).map((route) => `\`${route}\``).join(', ')}${quizRoutes.length > 50 ? ', ...' : ''}

## API routes/server endpoints
| Path | Methods | File | Supabase | Auth/session signal |
| --- | --- | --- | --- | --- |
${routeHandlerRows || '| none | | | | |'}

## Supabase usage summary
Detailed Supabase usage is generated by \`bun run perf:supabase\` into \`.ai/00_performance/results/supabase_query_inventory.json\` and summarized in \`07_supabase_database.md\`.

## Data-fetching architecture signals
- Source files scanned: ${sourceFiles.length}
- Data-fetching/Supabase/fetch files: ${dataFetching.length}
- Caching/revalidation/browser-storage files: ${caching.length}
- Client components: ${clientComponents.length}
- Server-action-like files: ${serverActions.length}
- React Query installed: ${inventory.dataFetchingArchitecture.hasReactQuery ? 'yes' : 'no'}
- SWR installed: ${inventory.dataFetchingArchitecture.hasSWR ? 'yes' : 'no'}
- Zustand installed: ${inventory.dataFetchingArchitecture.hasZustand ? 'yes' : 'no'}

## Existing E2E coverage
${e2eSpecs.map((spec) => `- \`${spec}\``).join('\n') || '- None detected.'}

## Known user journeys to measure
| Journey | Candidate paths |
| --- | --- |
${journeyRows}

## Caching inventory
Evidence from source scan:
- Server cache/revalidation/fetch-cache directive files: ${caching.length}
- Browser storage/cache-like state files are included in \`.ai/00_performance/results/inventory.json\`.
- Network/security headers are configured in \`next.config.ts\`.
- Supabase request caching is not globally evident from config; per-query evidence is in the Supabase inventory.

## Raw evidence
- Full inventory JSON: \`.ai/00_performance/results/inventory.json\`
- Route inventory JSON: \`.ai/00_performance/results/route_inventory.json\`
- Route target JSON: \`.ai/00_performance/results/frontend_route_targets.json\`
`)
