import path from 'node:path'
import { readFileSync } from 'node:fs'
import { ensurePerfDirs, repoPath, RESULTS_DIR, rel, safeJsonFile, summarizeNumbers, walk, writeMarkdown } from './perf-utils.mjs'

ensurePerfDirs()
const scanRoots = ['src', 'scripts', 'supabase'].map((root) => repoPath(root))
const files = scanRoots.flatMap((root) => walk(root, { include: (file) => /\.(ts|tsx|js|jsx|sql)$/.test(file) }))
const records = []
const queryBlocks = []

function sanitize(line) {
  return line
    .replace(/eyJ[A-Za-z0-9._-]{20,}/g, '[JWT_REDACTED]')
    .replace(/(service_role|anon)(_key)?\s*[:=]\s*['"][^'"]+['"]/gi, '$1$2: [REDACTED]')
    .trim()
}

for (const file of files) {
  const text = readFileSync(file, 'utf8')
  const lines = text.split(/\r?\n/)
  const isClient = /['"]use client['"]/.test(text.slice(0, 200))
  const isServerAction = /['"]use server['"]/.test(text.slice(0, 500)) || rel(file).includes('/actions/')
  const side = isClient ? 'client' : isServerAction || rel(file).includes('/app/') || rel(file).includes('/lib/') ? 'server-or-build' : 'unknown'

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    const matchers = [
      ['client-init', /create(Server|Browser)?Client\(/],
      ['auth', /\.auth\.(getUser|getSession|signIn|signOut|signUp|onAuthStateChange|exchangeCodeForSession|updateUser|resetPasswordForEmail)/],
      ['from', /\.from\(['"`]([^'"`]+)['"`]\)/],
      ['select', /\.select\(([^)]*)\)/],
      ['rpc', /\.rpc\(['"`]([^'"`]+)['"`]/],
      ['storage', /\.storage\b/],
      ['realtime', /\.channel\(['"`]([^'"`]+)['"`]/],
      ['insert', /\.insert\(/],
      ['update', /\.update\(/],
      ['delete', /\.delete\(/],
      ['upsert', /\.upsert\(/],
      ['limit', /\.limit\(/],
      ['range', /\.range\(/],
      ['order', /\.order\(/],
      ['filter', /\.(eq|neq|gt|gte|lt|lte|in|contains|containedBy|ilike|like|is|not|or|filter)\(/],
    ]
    for (const [type, regex] of matchers) {
      const match = trimmed.match(regex)
      if (match) {
        records.push({
          file: rel(file),
          line: index + 1,
          type,
          tableOrTarget: match[1] ?? null,
          side,
          code: sanitize(trimmed),
        })
      }
    }
  })

  for (const match of text.matchAll(/\.from\(['"`]([^'"`]+)['"`]\)([\s\S]{0,900})/g)) {
    const table = match[1]
    const snippet = match[0]
    const before = text.slice(0, match.index)
    const line = before.split(/\r?\n/).length
    queryBlocks.push({
      file: rel(file),
      line,
      table,
      side,
      hasSelectStar: /\.select\(\s*['"`]\*['"`]\s*\)/.test(snippet),
      hasSelect: /\.select\(/.test(snippet),
      hasLimit: /\.limit\(|\.range\(/.test(snippet),
      hasOrder: /\.order\(/.test(snippet),
      hasUserFilter: /\.eq\(\s*['"`]user_id['"`]|\.eq\(\s*['"`]id['"`]\s*,\s*userId|\.eq\(\s*['"`]profile_id['"`]/.test(snippet),
      hasMutation: /\.(insert|update|delete|upsert)\(/.test(snippet),
      hasMaybeSingle: /\.(single|maybeSingle)\(/.test(snippet),
      filters: [...snippet.matchAll(/\.(eq|neq|gt|gte|lt|lte|in|contains|containedBy|ilike|like|is|not|or|filter)\(/g)].map((m) => m[1]),
      snippet: sanitize(snippet.split(/\r?\n/).map((part) => part.trim()).filter(Boolean).slice(0, 12).join(' ')),
    })
  }
}

const tables = [...new Set(queryBlocks.map((q) => q.table))].sort()
const selectStar = queryBlocks.filter((q) => q.hasSelectStar)
const unboundedReads = queryBlocks.filter((q) => q.hasSelect && !q.hasLimit && !q.hasMaybeSingle && !q.hasMutation)
const clientSideQueries = queryBlocks.filter((q) => q.side === 'client')
const authCalls = records.filter((record) => record.type === 'auth')
const rpcCalls = records.filter((record) => record.type === 'rpc')
const storageCalls = records.filter((record) => record.type === 'storage')
const realtimeCalls = records.filter((record) => record.type === 'realtime')

const inventory = {
  timestamp: new Date().toISOString(),
  scannedFiles: files.length,
  totalSupabaseSignalLines: records.length,
  totalFromQueryBlocks: queryBlocks.length,
  tables,
  records,
  queryBlocks,
  summary: {
    tablesTouched: tables.length,
    selectStarCount: selectStar.length,
    unboundedReadCandidates: unboundedReads.length,
    clientSideQueryBlocks: clientSideQueries.length,
    authCallSignals: authCalls.length,
    rpcCallSignals: rpcCalls.length,
    storageCallSignals: storageCalls.length,
    realtimeCallSignals: realtimeCalls.length,
  },
  riskCandidates: {
    selectStar,
    unboundedReads,
    clientSideQueries,
    authCalls,
    rpcCalls,
    storageCalls,
    realtimeCalls,
  },
}

safeJsonFile(path.join(RESULTS_DIR, 'supabase_query_inventory.json'), inventory)
safeJsonFile(path.join(RESULTS_DIR, 'supabase_latency_results.json'), {
  timestamp: new Date().toISOString(),
  status: 'blocked-without-live-read-only-credentialed-query-plan',
  summary: { min: null, max: null, mean: null, median: null, p50: null, p75: null, p95: null, p99: null, stddev: null },
  notes: [
    'This script performs static inventory only and intentionally avoids live database reads/writes by default.',
    'Run targeted EXPLAIN/EXPLAIN ANALYZE manually or through a safe read-only database role for specific query shapes.',
  ],
})

const tableRows = tables.map((table) => `| \`${table}\` | ${queryBlocks.filter((q) => q.table === table).length} |`).join('\n')
const selectRows = selectStar.slice(0, 80).map((q) => `| \`${q.file}:${q.line}\` | \`${q.table}\` | ${q.side} |`).join('\n')
const unboundedRows = unboundedReads.slice(0, 100).map((q) => `| \`${q.file}:${q.line}\` | \`${q.table}\` | ${q.side} | ${q.hasOrder ? 'yes' : 'no'} |`).join('\n')
const authRows = authCalls.slice(0, 80).map((r) => `| \`${r.file}:${r.line}\` | ${r.side} | \`${r.code.replace(/\|/g, '\\|')}\` |`).join('\n')

writeMarkdown(path.join(process.cwd(), '.ai/00_performance/07_supabase_database.md'), `# 07 — Supabase / Database Performance Audit

Generated: ${inventory.timestamp}

## Scope and safety
This pass statically scanned \`src/\`, \`scripts/\`, and \`supabase/\` for Supabase and SQL performance signals. It did **not** run live read/write database operations and did not print or persist secrets.

## Inventory summary
- Files scanned: ${files.length}
- Supabase signal lines: ${records.length}
- \`.from(...)\` query blocks: ${queryBlocks.length}
- Tables/storage-like targets touched: ${tables.length}
- Auth call signals: ${authCalls.length}
- RPC call signals: ${rpcCalls.length}
- Storage call signals: ${storageCalls.length}
- Realtime channel signals: ${realtimeCalls.length}
- \`select('*')\` candidates: ${selectStar.length}
- Unbounded read candidates (no nearby \`.limit\`, \`.range\`, \`.single\`, or \`.maybeSingle\`): ${unboundedReads.length}
- Client-side Supabase query blocks: ${clientSideQueries.length}

## Tables/functions detected from query code
| Table/target | Query block count |
| --- | ---: |
${tableRows || '| none | 0 |'}

## Over-broad select candidates
These require human review: some may intentionally target tiny static tables or be constrained by RLS.

| Location | Table | Side |
| --- | --- | --- |
${selectRows || '| none detected | | |'}

## Missing-limit / broad-read candidates
| Location | Table | Side | Has order |
| --- | --- | --- | --- |
${unboundedRows || '| none detected | | | |'}

## Auth/session wait signals
Repeated auth/session calls can materially affect app-start-to-auth-known wait time.

| Location | Side | Code signal |
| --- | --- | --- |
${authRows || '| none detected | | |'}

## Live latency measurements
Live Supabase latency measurement is currently marked blocked in \`.ai/00_performance/results/supabase_latency_results.json\` because this audit avoids unaudited live credential/database access by default. Use a read-only test role or local seeded Supabase before running query timing or \`EXPLAIN ANALYZE\`.

## Manual EXPLAIN template
Use only for read-only query shapes and redact parameters before sharing output:

\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT explicit_column_list
FROM target_table
WHERE user_id = '<test-user-uuid>'
ORDER BY created_at DESC
LIMIT 50;
\`\`\`

## Raw evidence
- Query inventory: \`.ai/00_performance/results/supabase_query_inventory.json\`
- Latency/blocker record: \`.ai/00_performance/results/supabase_latency_results.json\`
`)
