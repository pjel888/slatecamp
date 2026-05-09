import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const perfDir = path.join(root, '.ai/00_performance')
const logsDir = path.join(perfDir, 'logs')
const resultsDir = path.join(perfDir, 'results')
fs.mkdirSync(logsDir, { recursive: true })
fs.mkdirSync(resultsDir, { recursive: true })

const logFile = path.join(logsDir, 'demo-auth-build.log')
const resultFile = path.join(resultsDir, 'demo_auth_build_result.json')
const startedAt = new Date()
const env = {
  ...process.env,
  NEXT_PUBLIC_ENABLE_DEMO_MODE: 'true',
  PLAYWRIGHT_DEMO_AUTH: 'true',
  PLAYWRIGHT_DEMO_ROLE: process.env.PLAYWRIGHT_DEMO_ROLE || 'super_admin',
  PLAYWRIGHT_DEMO_TIER: process.env.PLAYWRIGHT_DEMO_TIER || 'pro',
  NEXT_PUBLIC_PAYMENTS_ENABLED: 'false',
  DISABLE_DEV_FORCE_USER_ID: 'true',
  ALLOW_DEV_PORTAL_BYPASS: 'false',
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'ci-anon-key',
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://hrpdwqurngnyajuhbkdg.supabase.co',
}

const visibleEnv = {
  NEXT_PUBLIC_ENABLE_DEMO_MODE: env.NEXT_PUBLIC_ENABLE_DEMO_MODE,
  PLAYWRIGHT_DEMO_AUTH: env.PLAYWRIGHT_DEMO_AUTH,
  PLAYWRIGHT_DEMO_ROLE: env.PLAYWRIGHT_DEMO_ROLE,
  PLAYWRIGHT_DEMO_TIER: env.PLAYWRIGHT_DEMO_TIER,
  NEXT_PUBLIC_PAYMENTS_ENABLED: env.NEXT_PUBLIC_PAYMENTS_ENABLED,
  DISABLE_DEV_FORCE_USER_ID: env.DISABLE_DEV_FORCE_USER_ID,
  ALLOW_DEV_PORTAL_BYPASS: env.ALLOW_DEV_PORTAL_BYPASS,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[present-redacted]' : '[missing]',
  NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL ? '[present-redacted]' : '[missing]',
}

const printLogExcerpt = (file, maxLines = 160) => {
  if (!fs.existsSync(file)) return

  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
  const excerpt = lines.slice(-maxLines).join('\n')
  console.error(`\n--- demo-auth build log excerpt: ${path.relative(root, file)} ---`)
  console.error(excerpt)
  console.error('--- end demo-auth build log excerpt ---\n')
}

const header = [
  `command: bun run build`,
  `cwd: ${root}`,
  `start: ${startedAt.toISOString()}`,
  `env: ${JSON.stringify(visibleEnv)}`,
  '',
].join('\n')
fs.writeFileSync(logFile, header)

const result = spawnSync('bun', ['run', 'build'], {
  cwd: root,
  env,
  encoding: 'utf8',
  maxBuffer: 1024 * 1024 * 20,
})

fs.appendFileSync(logFile, result.stdout || '')
fs.appendFileSync(logFile, result.stderr || '')
const endedAt = new Date()
fs.appendFileSync(logFile, `\nend: ${endedAt.toISOString()}\nexit: ${result.status}\n`)

const payload = {
  timestamp: endedAt.toISOString(),
  command: 'bun run build',
  mode: 'demo-auth-built-app',
  exitCode: result.status,
  signal: result.signal,
  durationMs: endedAt.getTime() - startedAt.getTime(),
  logFile: path.relative(root, logFile),
  env: visibleEnv,
  success: result.status === 0,
  notes: [
    'Secret-like env values are redacted; this script records names/presence only.',
    'The default demo role is super_admin so protected admin prerender does not fail during demo-mode builds.',
  ],
}
fs.writeFileSync(resultFile, `${JSON.stringify(payload, null, 2)}\n`)
console.log(JSON.stringify(payload, null, 2))
if (result.status !== 0) printLogExcerpt(logFile)
process.exit(result.status ?? 1)
