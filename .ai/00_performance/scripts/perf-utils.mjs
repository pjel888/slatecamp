import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { performance } from 'node:perf_hooks'

export const ROOT = process.cwd()
export const PERF_DIR = path.join(ROOT, '.ai/00_performance')
export const RESULTS_DIR = path.join(PERF_DIR, 'results')
export const LOGS_DIR = path.join(PERF_DIR, 'logs')
export const RAW_DIR = path.join(PERF_DIR, 'raw')
export const TRACES_DIR = path.join(PERF_DIR, 'traces')
export const SCREENSHOTS_DIR = path.join(PERF_DIR, 'screenshots')

export function ensurePerfDirs() {
  for (const dir of [PERF_DIR, RESULTS_DIR, LOGS_DIR, RAW_DIR, TRACES_DIR, SCREENSHOTS_DIR, path.join(PERF_DIR, 'playwright'), path.join(PERF_DIR, 'scripts')]) {
    mkdirSync(dir, { recursive: true })
  }
}

export function repoPath(...parts) {
  return path.join(ROOT, ...parts)
}

export function rel(file) {
  return path.relative(ROOT, file).split(path.sep).join('/')
}

const ignored = new Set(['node_modules', '.git', '.next', 'playwright-report', 'test-results', '.turbo'])

export function walk(dir, options = {}) {
  const results = []
  const maxFiles = options.maxFiles ?? Number.POSITIVE_INFINITY
  const include = options.include ?? (() => true)
  const skipDir = options.skipDir ?? (() => false)

  function visit(current) {
    if (results.length >= maxFiles) return
    let entries
    try {
      entries = readdirSync(current, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        if (ignored.has(entry.name) || skipDir(full)) continue
        visit(full)
      } else if (entry.isFile()) {
        if (include(full)) results.push(full)
      }
      if (results.length >= maxFiles) return
    }
  }

  if (existsSync(dir)) visit(dir)
  return results
}

export function readText(file) {
  return readFileSync(file, 'utf8')
}

export function safeJsonFile(file, value) {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(value, null, 2) + '\n')
}

export function writeMarkdown(file, content) {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, content.trimEnd() + '\n')
}

export function percentile(sorted, p) {
  if (!sorted.length) return null
  const index = (sorted.length - 1) * p
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)
}

export function summarizeNumbers(values) {
  const nums = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b)
  if (!nums.length) {
    return { count: 0, min: null, max: null, mean: null, median: null, p50: null, p75: null, p95: null, p99: null, stddev: null }
  }
  const count = nums.length
  const sum = nums.reduce((acc, value) => acc + value, 0)
  const mean = sum / count
  const variance = nums.reduce((acc, value) => acc + (value - mean) ** 2, 0) / count
  return {
    count,
    min: nums[0],
    max: nums[count - 1],
    mean,
    median: percentile(nums, 0.5),
    p50: percentile(nums, 0.5),
    p75: percentile(nums, 0.75),
    p95: percentile(nums, 0.95),
    p99: percentile(nums, 0.99),
    stddev: Math.sqrt(variance),
  }
}

export function runCommand(command, args = [], options = {}) {
  const start = new Date()
  const startedAtMs = performance.now()
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? ROOT,
    env: { ...process.env, ...(options.env ?? {}) },
    encoding: 'utf8',
    maxBuffer: options.maxBuffer ?? 1024 * 1024 * 30,
    shell: options.shell ?? false,
  })
  const end = new Date()
  const durationMs = performance.now() - startedAtMs
  const stdout = result.stdout ?? ''
  const stderr = result.stderr ?? ''
  const exitCode = typeof result.status === 'number' ? result.status : result.error ? 1 : 0
  const record = {
    command: [command, ...args].join(' '),
    cwd: options.cwd ?? ROOT,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    durationMs,
    exitCode,
    signal: result.signal ?? null,
    error: result.error ? String(result.error) : null,
    stdout,
    stderr,
  }
  return record
}

export function writeCommandLog(name, records) {
  const logPath = path.join(LOGS_DIR, name)
  const lines = []
  for (const record of records) {
    lines.push(`## ${record.command}`)
    lines.push(`- Working directory: \`${record.cwd}\``)
    lines.push(`- Start time: ${record.startTime}`)
    lines.push(`- End time: ${record.endTime}`)
    lines.push(`- Exit code: ${record.exitCode}`)
    lines.push(`- Duration: ${Math.round(record.durationMs)} ms`)
    if (record.signal) lines.push(`- Signal: ${record.signal}`)
    if (record.error) lines.push(`- Error: ${record.error}`)
    lines.push('')
    lines.push('```text')
    lines.push(redactSecrets([record.stdout, record.stderr].filter(Boolean).join('\n')) || '(no output)')
    lines.push('```')
    lines.push('')
  }
  writeMarkdown(logPath, lines.join('\n'))
  return logPath
}

export function redactSecrets(text) {
  return String(text)
    .replace(/(SUPABASE_(?:SERVICE_ROLE|ANON)?_?KEY\s*[=:]\s*)[^\s]+/gi, '$1[REDACTED]')
    .replace(/(NEXT_PUBLIC_SUPABASE_ANON_KEY\s*[=:]\s*)[^\s]+/gi, '$1[REDACTED]')
    .replace(/(Authorization:\s*Bearer\s+)[A-Za-z0-9._~+\/-]+=*/gi, '$1[REDACTED]')
    .replace(/(eyJ[A-Za-z0-9._-]{20,})/g, '[JWT_REDACTED]')
}

export function fileSize(file) {
  try { return statSync(file).size } catch { return null }
}

export function cpuSummary() {
  const cpus = os.cpus() ?? []
  return {
    model: cpus[0]?.model ?? null,
    logicalCores: cpus.length,
    speedMHz: cpus[0]?.speed ?? null,
  }
}

export function routeFromAppFile(file) {
  const relative = rel(file).replace(/^src\/app\//, '')
  const segments = relative.split('/').slice(0, -1)
  const urlSegments = []
  for (const segment of segments) {
    if (!segment) continue
    if (segment.startsWith('(') && segment.endsWith(')')) continue
    if (segment.startsWith('@')) continue
    let cleaned = segment
      .replace(/^\(\.\.\.\)/, '')
      .replace(/^\(\.\.\)/, '')
      .replace(/^\(\.\)/, '')
    if (/^\[\.\.\.(.+)\]$/.test(cleaned)) cleaned = `:${cleaned.slice(4, -1)}*`
    else if (/^\[\[\.\.\.(.+)\]\]$/.test(cleaned)) cleaned = `:${cleaned.slice(5, -2)}*?`
    else if (/^\[(.+)\]$/.test(cleaned)) cleaned = `:${cleaned.slice(1, -1)}`
    urlSegments.push(cleaned)
  }
  return '/' + urlSegments.join('/')
}
