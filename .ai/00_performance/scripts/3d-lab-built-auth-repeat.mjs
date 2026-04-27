import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const perfDir = path.join(root, '.ai/00_performance')
const resultsDir = path.join(perfDir, 'results')
const logsDir = path.join(perfDir, 'logs')
fs.mkdirSync(resultsDir, { recursive: true })
fs.mkdirSync(logsDir, { recursive: true })

const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=')
  return [key, rest.join('=') || 'true']
}))

const passes = Number(args.get('passes') ?? process.env.THREED_BUILT_AUTH_PASSES ?? 3)
const skipBuild = args.get('skip-build') === 'true' || process.env.THREED_SKIP_DEMO_AUTH_BUILD === 'true'
const commandLog = path.join(logsDir, '3d-lab-built-auth-repeat.log')
const resultFile = path.join(resultsDir, '3d_lab_built_auth_repeat_results.json')

const runCommand = (label, command, commandArgs, env = {}) => {
  const startedAt = new Date()
  fs.appendFileSync(commandLog, [
    `\n## ${label}`,
    `command: ${[command, ...commandArgs].join(' ')}`,
    `cwd: ${root}`,
    `start: ${startedAt.toISOString()}`,
    '',
  ].join('\n'))

  const result = spawnSync(command, commandArgs, {
    cwd: root,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 40,
  })

  fs.appendFileSync(commandLog, result.stdout || '')
  fs.appendFileSync(commandLog, result.stderr || '')
  const endedAt = new Date()
  fs.appendFileSync(commandLog, `\nend: ${endedAt.toISOString()}\nexit: ${result.status}\n`)

  return {
    label,
    command: [command, ...commandArgs].join(' '),
    start: startedAt.toISOString(),
    end: endedAt.toISOString(),
    exitCode: result.status,
    signal: result.signal,
    durationMs: endedAt.getTime() - startedAt.getTime(),
  }
}

const readJsonIfExists = (file) => {
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

const routeSummary = (payload) => {
  const route = payload?.routeSummaries?.find((entry) => entry.route === '/dashboard/3d-lab') ?? payload?.routeSummaries?.[0]
  return route
    ? {
        route: route.route,
        coldP50Ms: route.cold?.p50 ?? null,
        coldP95Ms: route.cold?.p95 ?? null,
        warmP50Ms: route.warm?.p50 ?? null,
        warmP95Ms: route.warm?.p95 ?? null,
        requestP50: route.requests?.p50 ?? null,
        transferP50Bytes: route.transferredBytes?.p50 ?? null,
        errorCount: route.errorCount ?? null,
        finalUrls: route.finalUrls ?? null,
        contentSignals: route.contentSignals ?? null,
      }
    : null
}

fs.writeFileSync(commandLog, `3D Lab built-auth repeat run\nstart: ${new Date().toISOString()}\npasses: ${passes}\n`)

const commands = []
if (!skipBuild) {
  commands.push(runCommand('demo auth production build', 'bun', ['run', 'perf:build:demo-auth']))
}

const passResults = []
for (let pass = 1; pass <= passes; pass += 1) {
  const env = {
    PLAYWRIGHT_USE_BUILT_APP: 'true',
    PLAYWRIGHT_DEMO_AUTH: 'true',
    PERF_USER_FLOWS: 'false',
    PERF_ROUTE_FILTER: '/dashboard/3d-lab',
    PERF_ROUTE_LIMIT: '1',
    PERF_MEMORY_PROFILE_LABEL: `loop5-built-auth-3d-pass-${pass}`,
  }
  const command = runCommand(`built auth 3D pass ${pass}`, 'bun', ['run', 'perf:frontend'], env)
  commands.push(command)

  const source = path.join(resultsDir, 'frontend_navigation_results.json')
  const destination = path.join(resultsDir, `3d_lab_built_auth_pass_${pass}.json`)
  if (fs.existsSync(source)) fs.copyFileSync(source, destination)

  const payload = readJsonIfExists(destination)
  passResults.push({
    pass,
    command,
    resultFile: fs.existsSync(destination) ? path.relative(root, destination) : null,
    memoryProfileFile: path.relative(root, path.join(resultsDir, `dev_server_memory_profile_loop5-built-auth-3d-pass-${pass}.json`)),
    routeSummary: routeSummary(payload),
  })
}

const coldP95s = passResults.map((pass) => pass.routeSummary?.coldP95Ms).filter(Number.isFinite)
const warmP95s = passResults.map((pass) => pass.routeSummary?.warmP95Ms).filter(Number.isFinite)
const max = (values) => values.length ? Math.max(...values) : null
const min = (values) => values.length ? Math.min(...values) : null
const regressionThresholdPercent = 20
const coldRegressionPercent = coldP95s.length >= 2 && min(coldP95s)
  ? ((max(coldP95s) - min(coldP95s)) / min(coldP95s)) * 100
  : null
const warmRegressionPercent = warmP95s.length >= 2 && min(warmP95s)
  ? ((max(warmP95s) - min(warmP95s)) / min(warmP95s)) * 100
  : null

const payload = {
  timestamp: new Date().toISOString(),
  mode: 'built-auth-3d-repeat',
  passes,
  commandLog: path.relative(root, commandLog),
  resultFile: path.relative(root, resultFile),
  commands,
  passResults,
  summary: {
    completedPasses: passResults.filter((pass) => pass.command.exitCode === 0).length,
    coldP95Ms: { min: min(coldP95s), max: max(coldP95s), values: coldP95s },
    warmP95Ms: { min: min(warmP95s), max: max(warmP95s), values: warmP95s },
    coldRegressionPercent: coldRegressionPercent == null ? null : Math.round(coldRegressionPercent * 100) / 100,
    warmRegressionPercent: warmRegressionPercent == null ? null : Math.round(warmRegressionPercent * 100) / 100,
    regressionThresholdPercent,
    warningOnlyRegression: [coldRegressionPercent, warmRegressionPercent].some((value) => value != null && value > regressionThresholdPercent),
  },
  notes: [
    'Three comparable passes are required before 3D built-auth can be promoted from warning gate to candidate hard gate.',
    'This script stores only env-mode flags and never records credential values.',
  ],
}

fs.writeFileSync(resultFile, `${JSON.stringify(payload, null, 2)}\n`)
console.log(JSON.stringify(payload, null, 2))

const failedCommand = commands.find((command) => command.exitCode !== 0)
process.exit(failedCommand ? failedCommand.exitCode ?? 1 : 0)
