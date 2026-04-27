import path from 'node:path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const repoRoot = process.cwd()
const perfDir = path.join(repoRoot, '.ai/00_performance')
const resultsDir = path.join(perfDir, 'results')
mkdirSync(resultsDir, { recursive: true })

const args = process.argv.slice(2)
const getArg = (name, fallback) => {
  const prefix = `--${name}=`
  const value = args.find((arg) => arg.startsWith(prefix))
  return value ? value.slice(prefix.length) : fallback
}

const baseFile = getArg('base', path.join(resultsDir, 'dev_server_frontend_baseline_before_built_app.json'))
const candidateFile = getArg('candidate', path.join(resultsDir, 'built_app_frontend_baseline.json'))
const outFile = getArg('out', path.join(resultsDir, 'performance_comparison.json'))

const readJson = (file) => {
  const resolved = path.isAbsolute(file) ? file : path.join(repoRoot, file)
  if (!existsSync(resolved)) throw new Error(`Missing input: ${resolved}`)
  return { file: resolved, json: JSON.parse(readFileSync(resolved, 'utf8')) }
}

const round = (value) => Number.isFinite(value) ? Math.round(value * 100) / 100 : null
const metric = (summary, pathParts) => pathParts.reduce((value, key) => value?.[key], summary)
const delta = (base, candidate) => {
  if (!Number.isFinite(base) || !Number.isFinite(candidate)) return { base: base ?? null, candidate: candidate ?? null, delta: null, deltaPercent: null }
  return {
    base: round(base),
    candidate: round(candidate),
    delta: round(candidate - base),
    deltaPercent: base === 0 ? null : round(((candidate - base) / base) * 100),
  }
}

const routeByName = (payload) => Object.fromEntries((payload.routeSummaries ?? []).map((route) => [route.route, route]))
const compareRoute = (baseRoute, candidateRoute) => ({
  coldP50Ms: delta(baseRoute?.cold?.p50, candidateRoute?.cold?.p50),
  coldP95Ms: delta(baseRoute?.cold?.p95, candidateRoute?.cold?.p95),
  warmP50Ms: delta(baseRoute?.warm?.p50, candidateRoute?.warm?.p50),
  warmP95Ms: delta(baseRoute?.warm?.p95, candidateRoute?.warm?.p95),
  fcpP50Ms: delta(baseRoute?.fcp?.p50, candidateRoute?.fcp?.p50),
  lcpP50Ms: delta(baseRoute?.lcp?.p50, candidateRoute?.lcp?.p50),
  requestsP50: delta(baseRoute?.requests?.p50, candidateRoute?.requests?.p50),
  transferP50Bytes: delta(baseRoute?.transferredBytes?.p50, candidateRoute?.transferredBytes?.p50),
  errorCount: delta(baseRoute?.errorCount, candidateRoute?.errorCount),
})

const { file: basePath, json: base } = readJson(baseFile)
const { file: candidatePath, json: candidate } = readJson(candidateFile)
const baseRoutes = routeByName(base)
const candidateRoutes = routeByName(candidate)
const routes = [...new Set([...Object.keys(baseRoutes), ...Object.keys(candidateRoutes)])].sort()

const comparison = {
  timestamp: new Date().toISOString(),
  baseFile: path.relative(repoRoot, basePath),
  candidateFile: path.relative(repoRoot, candidatePath),
  summary: {
    coldP50Ms: delta(metric(base.summary, ['coldDurationMs', 'p50']), metric(candidate.summary, ['coldDurationMs', 'p50'])),
    coldP95Ms: delta(metric(base.summary, ['coldDurationMs', 'p95']), metric(candidate.summary, ['coldDurationMs', 'p95'])),
    warmP50Ms: delta(metric(base.summary, ['warmDurationMs', 'p50']), metric(candidate.summary, ['warmDurationMs', 'p50'])),
    warmP95Ms: delta(metric(base.summary, ['warmDurationMs', 'p95']), metric(candidate.summary, ['warmDurationMs', 'p95'])),
    fcpP50Ms: delta(metric(base.summary, ['fcpMs', 'p50']), metric(candidate.summary, ['fcpMs', 'p50'])),
    fcpP95Ms: delta(metric(base.summary, ['fcpMs', 'p95']), metric(candidate.summary, ['fcpMs', 'p95'])),
    lcpP50Ms: delta(metric(base.summary, ['lcpMs', 'p50']), metric(candidate.summary, ['lcpMs', 'p50'])),
    lcpP95Ms: delta(metric(base.summary, ['lcpMs', 'p95']), metric(candidate.summary, ['lcpMs', 'p95'])),
    requestsP50: delta(metric(base.summary, ['requestCount', 'p50']), metric(candidate.summary, ['requestCount', 'p50'])),
    requestsP95: delta(metric(base.summary, ['requestCount', 'p95']), metric(candidate.summary, ['requestCount', 'p95'])),
    transferP50Bytes: delta(metric(base.summary, ['transferredBytes', 'p50']), metric(candidate.summary, ['transferredBytes', 'p50'])),
    transferP95Bytes: delta(metric(base.summary, ['transferredBytes', 'p95']), metric(candidate.summary, ['transferredBytes', 'p95'])),
  },
  routes: Object.fromEntries(routes.map((route) => [route, compareRoute(baseRoutes[route], candidateRoutes[route])])),
  notes: [
    'This script compares Playwright frontend_navigation_results-style JSON files.',
    'A negative delta means the candidate was lower/faster/smaller than the base.',
    'Interpret auth-gated routes carefully: finalUrl may redirect to login in built-app runs without build-time demo auth or safe credentials.',
  ],
}

writeFileSync(path.isAbsolute(outFile) ? outFile : path.join(repoRoot, outFile), `${JSON.stringify(comparison, null, 2)}\n`)
console.log(`Wrote ${path.relative(repoRoot, path.isAbsolute(outFile) ? outFile : path.join(repoRoot, outFile))}`)
