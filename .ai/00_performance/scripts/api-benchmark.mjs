import path from 'node:path'
import { readFileSync } from 'node:fs'
import { ensurePerfDirs, repoPath, RESULTS_DIR, LOGS_DIR, rel, routeFromAppFile, safeJsonFile, summarizeNumbers, walk, writeMarkdown } from './perf-utils.mjs'

ensurePerfDirs()
const baseUrl = process.env.PERF_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3217'
const repeat = Number(process.env.PERF_API_REPEAT ?? 5)
const timeoutMs = Number(process.env.PERF_API_TIMEOUT_MS ?? 15_000)
const routeFiles = walk(repoPath('src/app'), { include: (file) => /\/route\.(ts|js)$/.test(file) })
const endpoints = routeFiles.map((file) => {
  const text = readFileSync(file, 'utf8')
  const methods = [...text.matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/g)].map((m) => m[1])
  return {
    path: routeFromAppFile(file),
    file: rel(file),
    methods,
    hasDynamicSegment: routeFromAppFile(file).includes(':'),
    usesSupabase: /supabase|createClient|createServerClient|createBrowserClient|\.from\(|\.rpc\(/.test(text),
    usesAuth: /\.auth\.|getUser\(|getSession\(|require[A-Z][A-Za-z]*Auth|requireUser|updateSession/.test(text),
    usesExternalFetch: /fetch\(/.test(text),
    cacheSignals: [...new Set([...(text.match(/revalidate(Path|Tag)?|unstable_cache|cache:\s*['"][^'"]+|dynamic\s*=/g) ?? [])])],
  }
}).sort((a, b) => a.path.localeCompare(b.path))

async function timedFetch(endpoint) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const started = performance.now()
  try {
    const response = await fetch(new URL(endpoint.path, baseUrl), {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: { 'x-slatecamp-perf-audit': '1' },
    })
    const firstByteMs = performance.now() - started
    const body = await response.arrayBuffer().catch(() => new ArrayBuffer(0))
    const totalMs = performance.now() - started
    return {
      status: response.status,
      ok: response.ok,
      redirected: response.headers.has('location'),
      locationPath: response.headers.get('location') ? new URL(response.headers.get('location'), baseUrl).pathname : null,
      responseBytes: body.byteLength,
      ttfbProxyMs: firstByteMs,
      totalMs,
      error: null,
    }
  } catch (error) {
    return { status: null, ok: false, redirected: false, locationPath: null, responseBytes: 0, ttfbProxyMs: null, totalMs: performance.now() - started, error: String(error?.message ?? error) }
  } finally {
    clearTimeout(timer)
  }
}

const runs = []
const benchmarkable = endpoints.filter((endpoint) => endpoint.methods.includes('GET') && !endpoint.hasDynamicSegment)
let autoStartedServer = false
let autoStartLog = null
let serverProcess = null

async function canReachServer() {
  try {
    await fetch(baseUrl, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(5000) })
    return true
  } catch {
    return false
  }
}

let serverReachable = await canReachServer()
const base = new URL(baseUrl)
if (!serverReachable && process.env.PERF_API_START_SERVER !== 'false' && ['localhost', '127.0.0.1'].includes(base.hostname)) {
  autoStartLog = path.join(LOGS_DIR, 'perf-api-autostart-webserver.log')
  const port = base.port || '3217'
  const command = `PLAYWRIGHT_DEMO_AUTH=true PLAYWRIGHT_PORT=${port} exec bun scripts/playwright-web-server.ts > ${autoStartLog} 2>&1`
  serverProcess = Bun.spawn(['sh', '-c', command], { cwd: process.cwd(), stdin: 'ignore', stdout: 'ignore', stderr: 'ignore' })
  autoStartedServer = true
  for (let i = 0; i < 90; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    serverReachable = await canReachServer()
    if (serverReachable) break
  }
}

try {
  if (serverReachable) {
    for (const endpoint of benchmarkable) {
      for (let i = 0; i < repeat; i += 1) {
        runs.push({ endpoint: endpoint.path, file: endpoint.file, runIndex: i + 1, scenario: i === 0 ? 'first' : 'warm-repeat', ...(await timedFetch(endpoint)) })
      }
    }
  }
} finally {
  if (serverProcess) {
    serverProcess.kill()
    await serverProcess.exited.catch(() => null)
  }
}

const endpointSummaries = benchmarkable.map((endpoint) => {
  const endpointRuns = runs.filter((run) => run.endpoint === endpoint.path)
  return {
    endpoint: endpoint.path,
    file: endpoint.file,
    methods: endpoint.methods,
    usesSupabase: endpoint.usesSupabase,
    usesAuth: endpoint.usesAuth,
    cacheSignals: endpoint.cacheSignals,
    runCount: endpointRuns.length,
    errorRate: endpointRuns.length ? endpointRuns.filter((run) => run.error || run.status >= 500).length / endpointRuns.length : null,
    timeoutRate: endpointRuns.length ? endpointRuns.filter((run) => String(run.error ?? '').includes('aborted') || String(run.error ?? '').includes('timeout')).length / endpointRuns.length : null,
    statusCodes: [...new Set(endpointRuns.map((run) => run.status).filter(Boolean))],
    latencyMs: summarizeNumbers(endpointRuns.map((run) => run.totalMs)),
    ttfbProxyMs: summarizeNumbers(endpointRuns.map((run) => run.ttfbProxyMs)),
    responseBytes: summarizeNumbers(endpointRuns.map((run) => run.responseBytes)),
  }
})

const result = {
  timestamp: new Date().toISOString(),
  baseUrl,
  repeat,
  timeoutMs,
  serverReachable,
  autoStartedServer,
  autoStartLog: autoStartLog ? rel(autoStartLog) : null,
  endpoints,
  benchmarkableGetEndpoints: benchmarkable,
  runs,
  endpointSummaries,
  summary: summarizeNumbers(runs.map((run) => run.totalMs)),
  notes: serverReachable ? [
    'Only static GET route handlers were automatically benchmarked to avoid destructive operations and missing dynamic params.',
    'TTFB proxy is measured as fetch response header arrival time in the Node/Bun fetch client.',
    autoStartedServer ? 'The script auto-started a local Playwright web server because the target was initially unreachable.' : 'The target server was already reachable before benchmarking.',
  ] : [
    `Server was not reachable at ${baseUrl}; API latency measurement is blocked until a local/prod-like server is running.`,
  ],
}

safeJsonFile(path.join(RESULTS_DIR, 'api_benchmark_results.json'), result)
const rows = endpointSummaries.map((s) => `| \`${s.endpoint}\` | \`${s.file}\` | ${s.statusCodes.join(', ') || 'n/a'} | ${s.runCount} | ${s.latencyMs.p50?.toFixed?.(1) ?? 'n/a'} | ${s.latencyMs.p95?.toFixed?.(1) ?? 'n/a'} | ${s.responseBytes.mean?.toFixed?.(0) ?? 'n/a'} | ${s.usesSupabase ? 'yes' : 'no'} | ${s.usesAuth ? 'yes' : 'no'} |`).join('\n')
const endpointRows = endpoints.map((endpoint) => `| \`${endpoint.path}\` | ${endpoint.methods.join(', ') || 'none'} | \`${endpoint.file}\` | ${endpoint.hasDynamicSegment ? 'dynamic route blocked' : endpoint.methods.includes('GET') ? 'GET measured when server reachable' : 'non-GET read-only skipped'} |`).join('\n')

writeMarkdown(path.join(process.cwd(), '.ai/00_performance/06_api_backend.md'), `# 06 — API / Backend Performance

Generated: ${result.timestamp}

## Measurement safety
Automatic latency measurement is limited to non-dynamic \`GET\` route handlers. Mutation endpoints (POST/PUT/PATCH/DELETE) are inventoried but not called to avoid destructive or side-effectful operations.

## Endpoint inventory
| Path | Methods | File | Benchmark status |
| --- | --- | --- | --- |
${endpointRows || '| none | | | |'}

## GET benchmark target
- Base URL: \`${baseUrl}\`
- Repeat count per benchmarkable endpoint: ${repeat}
- Timeout: ${timeoutMs} ms
- Server reachable: ${serverReachable ? 'yes' : 'no'}
- Auto-started local server: ${autoStartedServer ? 'yes' : 'no'}${autoStartLog ? ` (log: \`${rel(autoStartLog)}\`)` : ''}

## Benchmark results
| Endpoint | File | Status codes | Runs | p50 total ms | p95 total ms | Mean bytes | Supabase | Auth |
| --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- |
${rows || '| no measured endpoints | | | | | | | | |'}

## Whole-measurement summary
- p50: ${result.summary.p50?.toFixed?.(1) ?? 'n/a'} ms
- p75: ${result.summary.p75?.toFixed?.(1) ?? 'n/a'} ms
- p95: ${result.summary.p95?.toFixed?.(1) ?? 'n/a'} ms
- p99: ${result.summary.p99?.toFixed?.(1) ?? 'n/a'} ms
- min/max: ${result.summary.min?.toFixed?.(1) ?? 'n/a'} / ${result.summary.max?.toFixed?.(1) ?? 'n/a'} ms
- mean/stddev: ${result.summary.mean?.toFixed?.(1) ?? 'n/a'} / ${result.summary.stddev?.toFixed?.(1) ?? 'n/a'} ms

## Blockers and limitations
${serverReachable ? '- Dynamic route handlers need fixture parameters before safe benchmarking.\n- Auth-required and mutation endpoints need safe test fixtures and non-production credentials before timing.' : `- Server was not reachable at \`${baseUrl}\`; run \`bun run dev\` or a Playwright web server first, then rerun \`bun run perf:api\`.`}

## Raw evidence
- \`.ai/00_performance/results/api_benchmark_results.json\`
`)
