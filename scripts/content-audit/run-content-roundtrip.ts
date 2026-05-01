#!/usr/bin/env bun
import { spawnSync } from 'node:child_process'
import { parseArgs } from './lib'

const commandMap: Record<string, string> = {
  export: 'scripts/content-audit/export-article-bundles.ts',
  normalize: 'scripts/content-audit/normalize-article-bundles.ts',
  inventory: 'scripts/content-audit/scan-component-inventory.ts',
  components: 'scripts/content-audit/scan-component-inventory.ts',
  compose: 'scripts/content-audit/compose-candidates.ts',
  diff: 'scripts/content-audit/diff-candidates.ts',
  validate: 'scripts/content-audit/validate-bundles.ts',
  push: 'scripts/content-audit/push-candidates-to-supabase.ts',
}

const options = parseArgs()
const command = options.command
if (!command || !commandMap[command]) {
  console.error(`Usage: bun scripts/content-audit/run-content-roundtrip.ts <${Object.keys(commandMap).join('|')}> [flags]`)
  process.exit(1)
}

const passthrough = process.argv.slice(3)
const result = spawnSync('bun', [commandMap[command], ...passthrough], { stdio: 'inherit' })
process.exit(result.status ?? 1)
