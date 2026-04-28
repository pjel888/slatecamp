import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const port = process.env.PLAYWRIGHT_PORT ?? '3217'
const useBuiltApp = process.env.PLAYWRIGHT_USE_BUILT_APP === 'true'
const demoAuthEnabled = process.env.PLAYWRIGHT_DEMO_AUTH === 'true'
const memoryProfilingEnabled = process.env.PERF_DEV_SERVER_MEMORY_PROFILE !== 'false'

const perfDir = path.join(process.cwd(), '.ai/00_performance')
const resultsDir = path.join(perfDir, 'results')
mkdirSync(resultsDir, { recursive: true })

const slug = (value: string) =>
  value
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'default'

const memoryLabel = slug(
  process.env.PERF_MEMORY_PROFILE_LABEL ||
    (useBuiltApp ? 'built-app' : 'dev-server'),
)
const memoryProfileFile =
  process.env.PERF_MEMORY_PROFILE_FILE ||
  path.join(resultsDir, `dev_server_memory_profile_${memoryLabel}.json`)

const env = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] => {
    return typeof entry[1] === 'string'
  }),
)

delete env.DEV_FORCE_USER_ID
delete env.DEV_FORCE_TIER
delete env.NEXT_PUBLIC_DEMO_MODE

env.ALLOW_DEV_PORTAL_BYPASS = 'false'
env.DISABLE_DEV_FORCE_USER_ID = 'true'
env.NEXT_PUBLIC_APP_URL ??= `http://localhost:${port}`
env.NEXT_PUBLIC_ENABLE_DEMO_MODE = demoAuthEnabled ? 'true' : 'false'
env.NEXT_PUBLIC_PAYMENTS_ENABLED ??= 'false'
if (demoAuthEnabled) {
  env.PLAYWRIGHT_DEMO_ROLE ??= 'super_admin'
  env.PLAYWRIGHT_DEMO_TIER ??= 'pro'
}
env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= 'ci-anon-key'
env.NEXT_PUBLIC_SUPABASE_URL ??= 'https://hrpdwqurngnyajuhbkdg.supabase.co'

const nextBin =
  process.platform === 'win32'
    ? './node_modules/.bin/next.cmd'
    : './node_modules/.bin/next'

const args = useBuiltApp
  ? ['start', '--port', port]
  : ['dev', '--webpack', '--port', port]

function processIsAlive(pid: number) {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

function clearStaleNextDevLock() {
  if (useBuiltApp) return

  const devDir = path.join(process.cwd(), '.next/dev')
  const lockPath = path.join(devDir, 'lock')
  if (!existsSync(lockPath)) return

  try {
    const lock = JSON.parse(readFileSync(lockPath, 'utf8')) as { pid?: unknown }
    const pid = typeof lock.pid === 'number' ? lock.pid : Number(lock.pid)
    if (Number.isFinite(pid) && processIsAlive(pid)) {
      return
    }

    rmSync(devDir, { force: true, recursive: true })
    console.warn(`[playwright-web-server] Removed stale Next dev cache at ${devDir}`)
  } catch (error) {
    console.warn(
      `[playwright-web-server] Could not inspect Next dev lock at ${lockPath}: ${String(error)}`,
    )
  }
}

clearStaleNextDevLock()

const server = Bun.spawn([nextBin, ...args], {
  env,
  stdin: 'ignore',
  stdout: 'pipe',
  stderr: 'pipe',
})

type ProcessSample = {
  pid: number
  ppid: number
  rssKiB: number
  vszKiB: number
  command: string
}

type MemorySample = {
  timestamp: string
  elapsedMs: number
  rootPid: number | null
  processCount: number
  rssKiB: number
  vszKiB: number
  topProcesses: ProcessSample[]
}

const memorySamples: MemorySample[] = []
const warnings: Array<{ timestamp: string; source: 'stdout' | 'stderr'; message: string }> = []
const memoryStartedAt = performance.now()

function readProcessTable() {
  try {
    const output = execFileSync('ps', ['-axo', 'pid=,ppid=,rss=,vsz=,comm='], {
      encoding: 'utf8',
    })

    return output
      .trim()
      .split('\n')
      .map((line) => {
        const match = line.trim().match(/^(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(.+)$/)
        if (!match) return null
        return {
          pid: Number(match[1]),
          ppid: Number(match[2]),
          rssKiB: Number(match[3]),
          vszKiB: Number(match[4]),
          command: match[5],
        }
      })
      .filter((process): process is ProcessSample => process != null)
  } catch {
    return []
  }
}

function processTree(rootPid: number) {
  const processes = readProcessTable()
  const byParent = new Map<number, ProcessSample[]>()
  for (const process of processes) {
    const group = byParent.get(process.ppid) ?? []
    group.push(process)
    byParent.set(process.ppid, group)
  }

  const found: ProcessSample[] = []
  const queue = [rootPid]
  const seen = new Set<number>()

  while (queue.length) {
    const pid = queue.shift()!
    if (seen.has(pid)) continue
    seen.add(pid)

    const current = processes.find((process) => process.pid === pid)
    if (current) found.push(current)

    for (const child of byParent.get(pid) ?? []) {
      queue.push(child.pid)
    }
  }

  return found
}

function summarizeMemory(samples: MemorySample[]) {
  if (!samples.length) {
    return {
      sampleCount: 0,
      maxRssKiB: null,
      lastRssKiB: null,
      maxProcessCount: null,
      lastProcessCount: null,
    }
  }

  return {
    sampleCount: samples.length,
    maxRssKiB: Math.max(...samples.map((sample) => sample.rssKiB)),
    lastRssKiB: samples.at(-1)?.rssKiB ?? null,
    maxProcessCount: Math.max(...samples.map((sample) => sample.processCount)),
    lastProcessCount: samples.at(-1)?.processCount ?? null,
  }
}

function writeMemoryProfile(final = false) {
  if (!memoryProfilingEnabled) return

  const payload = {
    timestamp: new Date().toISOString(),
    final,
    mode: useBuiltApp ? 'built-app' : 'dev-server',
    command: [nextBin, ...args].join(' '),
    rootPid: server.pid ?? null,
    label: memoryLabel,
    sampleIntervalMs: 1_000,
    summary: summarizeMemory(memorySamples),
    warnings,
    samples: memorySamples,
    notes: [
      'RSS/VSZ are sampled from the local process tree rooted at the Next server process.',
      'Values are host/process proxies, not browser heap and not production RUM.',
    ],
  }

  writeFileSync(memoryProfileFile, `${JSON.stringify(payload, null, 2)}\n`)
}

async function forwardOutput(
  stream: ReadableStream<Uint8Array> | null,
  target: NodeJS.WriteStream,
  source: 'stdout' | 'stderr',
) {
  if (!stream) return

  const decoder = new TextDecoder()
  const reader = stream.getReader()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value, { stream: true })
      target.write(text)
      if (text.includes('Server is approaching the used memory threshold')) {
        warnings.push({
          timestamp: new Date().toISOString(),
          source,
          message: 'Server is approaching the used memory threshold',
        })
        writeMemoryProfile(false)
      }
    }
  } finally {
    reader.releaseLock()
  }
}

function sampleMemory() {
  if (!memoryProfilingEnabled || !server.pid) return

  const tree = processTree(server.pid)
  const rssKiB = tree.reduce((sum, process) => sum + process.rssKiB, 0)
  const vszKiB = tree.reduce((sum, process) => sum + process.vszKiB, 0)

  memorySamples.push({
    timestamp: new Date().toISOString(),
    elapsedMs: Math.round(performance.now() - memoryStartedAt),
    rootPid: server.pid,
    processCount: tree.length,
    rssKiB,
    vszKiB,
    topProcesses: [...tree]
      .sort((a, b) => b.rssKiB - a.rssKiB)
      .slice(0, 10),
  })
  writeMemoryProfile(false)
}

const memoryInterval = memoryProfilingEnabled
  ? setInterval(sampleMemory, 1_000)
  : null

void forwardOutput(server.stdout, process.stdout, 'stdout')
void forwardOutput(server.stderr, process.stderr, 'stderr')

const stop = () => {
  if (memoryInterval) clearInterval(memoryInterval)
  sampleMemory()
  writeMemoryProfile(true)
  server.kill()
}

process.on('SIGINT', stop)
process.on('SIGTERM', stop)

const exitCode = await server.exited
if (memoryInterval) clearInterval(memoryInterval)
sampleMemory()
writeMemoryProfile(true)

process.exit(exitCode)

export {}
