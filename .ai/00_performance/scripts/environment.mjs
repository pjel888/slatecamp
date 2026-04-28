import os from 'node:os'
import path from 'node:path'
import { ensurePerfDirs, RESULTS_DIR, runCommand, safeJsonFile, writeCommandLog, writeMarkdown, cpuSummary } from './perf-utils.mjs'

ensurePerfDirs()
const commands = [
  runCommand('git', ['rev-parse', 'HEAD']),
  runCommand('git', ['branch', '--show-current']),
  runCommand('git', ['status', '--short']),
  runCommand('node', ['--version']),
  runCommand('bun', ['--version']),
  runCommand('./node_modules/.bin/playwright', ['--version']),
]
writeCommandLog('environment-commands.md', commands)

const envNames = Object.keys(process.env)
  .filter((name) => /^(CI|NODE_|BUN_|NEXT_|PLAYWRIGHT_|VERCEL|SUPABASE|DATABASE|SENTRY|PAYREX|LEMON|ANTHROPIC|OPENAI)/i.test(name))
  .sort()

const environment = {
  timestamp: new Date().toISOString(),
  gitCommit: commands[0].stdout.trim() || null,
  branch: commands[1].stdout.trim() || null,
  gitStatusShort: commands[2].stdout.trim().split('\n').filter(Boolean),
  os: {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    type: os.type(),
  },
  cpu: cpuSummary(),
  memory: {
    totalBytes: os.totalmem(),
    freeBytes: os.freemem(),
  },
  versions: {
    node: commands[3].stdout.trim() || null,
    bun: commands[4].stdout.trim() || null,
    playwright: commands[5].stdout.trim() || null,
  },
  browser: {
    source: 'Playwright-managed browser, exact executable version captured by Playwright at runtime when perf tests run.',
  },
  runLocation: process.env.CI ? 'ci' : 'local',
  baseUrl: process.env.PERF_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3217',
  supabaseEnvironmentType: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured-env-url' : 'playwright-fallback-url-or-unconfigured',
  environmentVariableNamesOnly: envNames,
  notes: [
    'Only environment variable names are recorded; values are intentionally omitted.',
    'Supabase credentials are not printed or persisted by this script.',
  ],
}

safeJsonFile(path.join(RESULTS_DIR, 'environment.json'), environment)
writeMarkdown(path.join(process.cwd(), '.ai/00_performance/02_environment.md'), `# 02 — Environment Capture

Generated: ${environment.timestamp}

## Git
- Commit: \`${environment.gitCommit ?? 'unknown'}\`
- Branch: \`${environment.branch ?? 'unknown'}\`
- Working tree status entries at capture time: ${environment.gitStatusShort.length}

## Machine
- OS: ${environment.os.type} ${environment.os.release} (${environment.os.platform}/${environment.os.arch})
- CPU: ${environment.cpu.model ?? 'unknown'} (${environment.cpu.logicalCores} logical cores)
- RAM: ${(environment.memory.totalBytes / 1024 / 1024 / 1024).toFixed(2)} GiB total, ${(environment.memory.freeBytes / 1024 / 1024 / 1024).toFixed(2)} GiB free at capture

## Runtime versions
- Node: \`${environment.versions.node ?? 'unavailable'}\`
- Bun: \`${environment.versions.bun ?? 'unavailable'}\`
- Playwright: \`${environment.versions.playwright ?? 'unavailable'}\`

## Run location and target
- Location: ${environment.runLocation}
- Default base URL: \`${environment.baseUrl}\`
- Supabase environment type: ${environment.supabaseEnvironmentType}

## Relevant environment variables present (names only)
${environment.environmentVariableNamesOnly.length ? environment.environmentVariableNamesOnly.map((name) => `- \`${name}\``).join('\n') : '- None detected from the audited prefixes.'}

## Evidence
- Raw JSON: \`.ai/00_performance/results/environment.json\`
- Command log: \`.ai/00_performance/logs/environment-commands.md\`

## Secret handling
No environment variable values, tokens, cookies, Supabase keys, or credentials were written.
`)
