import path from 'node:path'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { ensurePerfDirs, repoPath, RESULTS_DIR, LOGS_DIR, fileSize, runCommand, safeJsonFile, summarizeNumbers, walk, writeCommandLog, writeMarkdown } from './perf-utils.mjs'

ensurePerfDirs()
const repeat = Number(process.env.PERF_BUILD_REPEAT ?? 1)
const commands = []
commands.push(runCommand('bun', ['--version']))
commands.push(runCommand('node', ['--version']))

for (let i = 0; i < repeat; i += 1) {
  commands.push(runCommand('bun', ['run', 'build'], { maxBuffer: 1024 * 1024 * 60 }))
}
commands.push(runCommand('bun', ['run', 'type-check'], { maxBuffer: 1024 * 1024 * 60 }))
writeCommandLog('build-startup-commands.md', commands)

const buildRuns = commands.filter((command) => command.command === 'bun run build')
const typeCheckRuns = commands.filter((command) => command.command === 'bun run type-check')
const nextStaticFiles = existsSync(repoPath('.next/static')) ? walk(repoPath('.next/static'), { include: () => true }) : []
const nextServerFiles = existsSync(repoPath('.next/server')) ? walk(repoPath('.next/server'), { include: () => true }) : []
const largestStatic = nextStaticFiles.map((file) => ({ file: file.replace(repoPath('') + '/', ''), bytes: fileSize(file) ?? 0 })).sort((a, b) => b.bytes - a.bytes).slice(0, 60)
const largestServer = nextServerFiles.map((file) => ({ file: file.replace(repoPath('') + '/', ''), bytes: fileSize(file) ?? 0 })).sort((a, b) => b.bytes - a.bytes).slice(0, 40)
const packageJson = JSON.parse(await Bun.file(repoPath('package.json')).text())
const deps = { ...(packageJson.dependencies ?? {}), ...(packageJson.devDependencies ?? {}) }
const heavyDeps = ['three', '@react-three/fiber', '@react-three/drei', 'framer-motion', 'recharts', 'mermaid', '@tiptap/react', '@uiw/react-codemirror', 'marked', 'isomorphic-dompurify', 'papaparse', 'openai', '@anthropic-ai/sdk'].filter((dep) => deps[dep])
const result = {
  timestamp: new Date().toISOString(),
  repeat,
  build: {
    runs: buildRuns.map((run, index) => ({ runIndex: index + 1, durationMs: run.durationMs, exitCode: run.exitCode })),
    summary: summarizeNumbers(buildRuns.map((run) => run.durationMs)),
  },
  typeCheck: {
    runs: typeCheckRuns.map((run, index) => ({ runIndex: index + 1, durationMs: run.durationMs, exitCode: run.exitCode })),
    summary: summarizeNumbers(typeCheckRuns.map((run) => run.durationMs)),
  },
  largestStaticAssets: largestStatic,
  largestServerFiles: largestServer,
  heavyDependenciesPresent: heavyDeps,
  notes: [
    'Build command output is stored in logs/build-startup-commands.md.',
    'Largest assets are read from .next after build; if build fails, this may reflect a previous build artifact.',
  ],
}

safeJsonFile(path.join(RESULTS_DIR, 'build_startup_results.json'), result)
const assetRows = largestStatic.slice(0, 30).map((asset) => `| \`${asset.file}\` | ${(asset.bytes / 1024).toFixed(1)} KiB |`).join('\n')
const serverRows = largestServer.slice(0, 20).map((asset) => `| \`${asset.file}\` | ${(asset.bytes / 1024).toFixed(1)} KiB |`).join('\n')
writeMarkdown(path.join(process.cwd(), '.ai/00_performance/10_bundle_build_startup.md'), `# 10 — Bundle, Build, and Startup Performance

Generated: ${result.timestamp}

## Commands measured
- \`bun run build\` repeat count: ${repeat}
- \`bun run type-check\` repeat count: 1

## Build timing
- Exit codes: ${result.build.runs.map((run) => run.exitCode).join(', ') || 'n/a'}
- p50: ${result.build.summary.p50?.toFixed?.(0) ?? 'n/a'} ms
- p95: ${result.build.summary.p95?.toFixed?.(0) ?? 'n/a'} ms
- min/max: ${result.build.summary.min?.toFixed?.(0) ?? 'n/a'} / ${result.build.summary.max?.toFixed?.(0) ?? 'n/a'} ms
- mean/stddev: ${result.build.summary.mean?.toFixed?.(0) ?? 'n/a'} / ${result.build.summary.stddev?.toFixed?.(0) ?? 'n/a'} ms

## Typecheck timing
- Exit codes: ${result.typeCheck.runs.map((run) => run.exitCode).join(', ') || 'n/a'}
- Duration: ${result.typeCheck.summary.mean?.toFixed?.(0) ?? 'n/a'} ms

## Largest static build artifacts
| File | Size |
| --- | ---: |
${assetRows || '| no .next/static artifacts found | |'}

## Largest server build artifacts
| File | Size |
| --- | ---: |
${serverRows || '| no .next/server artifacts found | |'}

## Heavy dependency signals
${heavyDeps.length ? heavyDeps.map((dep) => `- \`${dep}\` (${deps[dep]})`).join('\n') : '- None from the tracked list.'}

## Raw evidence
- \`.ai/00_performance/results/build_startup_results.json\`
- \`.ai/00_performance/logs/build-startup-commands.md\`
`)
