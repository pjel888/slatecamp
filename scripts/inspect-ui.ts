#!/usr/bin/env bun
/**
 * AI UI Inspection runner
 *
 * Starts the app (via the existing Playwright webServer), opens the homepage,
 * captures screenshots, console errors, network failures, and visible text,
 * then writes a structured report to test-results/ai-inspection/.
 *
 * The command exits with a non-zero code when serious UI problems are detected
 * (uncaught errors, critical network failures, missing expected content).
 *
 * Port behavior:
 * - Default: 3217 (avoids conflict with the dev server on 3000)
 * - Override: PLAYWRIGHT_PORT=3000 bun scripts/inspect-ui.ts
 *   (inspects an already-running dev server instead of starting a new one)
 *
 * Usage:
 *   bun scripts/inspect-ui.ts
 *   bun scripts/inspect-ui.ts --headed
 *   PLAYWRIGHT_PORT=3000 bun scripts/inspect-ui.ts
 */

import { spawn } from 'node:child_process'
import path from 'node:path'

const args = process.argv.slice(2)

const playwrightBin =
  process.platform === 'win32'
    ? './node_modules/.bin/playwright.cmd'
    : './node_modules/.bin/playwright'

const env = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] => {
    return typeof entry[1] === 'string'
  }),
)

// Force a clean inspection run
delete env.NO_COLOR
env.PLAYWRIGHT_DEMO_AUTH = 'false'
env.NEXT_PUBLIC_ENABLE_DEMO_MODE = 'false'

// Default to 3217 to avoid conflicting with the dev server on 3000.
// The user can override with PLAYWRIGHT_PORT to inspect an existing server.
env.PLAYWRIGHT_PORT ??= '3217'

const extraArgs: string[] = []
if (args.includes('--headed')) {
  extraArgs.push('--headed')
}
if (args.includes('--ui')) {
  extraArgs.push('--ui')
}

const commandArgs = [
  'test',
  'e2e/ai-inspection.spec.ts',
  '--project=chromium',
  ...extraArgs,
]

console.log(`[inspect-ui] Running: ${playwrightBin} ${commandArgs.join(' ')}`)
console.log(`[inspect-ui] Target port: ${env.PLAYWRIGHT_PORT}`)
console.log(`[inspect-ui] Report will be written to: ${path.join(process.cwd(), 'test-results', 'ai-inspection')}`)

const proc = spawn(playwrightBin, commandArgs, {
  env: env as unknown as NodeJS.ProcessEnv,
  stdio: 'inherit',
  shell: false,
})

proc.on('exit', (code) => {
  process.exit(code ?? 0)
})
