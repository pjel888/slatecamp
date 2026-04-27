import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const perfDir = path.join(root, '.ai/00_performance')
const resultsDir = path.join(perfDir, 'results')
const logsDir = path.join(perfDir, 'logs')
const historyRoot = path.join(resultsDir, 'history')

const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=')
  return [key, rest.join('=') || 'true']
}))

const mode = String(args.get('mode') ?? 'local-dev').replace(/[^a-z0-9_.-]+/gi, '-').replace(/^-|-$/g, '') || 'local-dev'
const label = args.get('label') ? String(args.get('label')).replace(/[^a-z0-9_.-]+/gi, '-').replace(/^-|-$/g, '') : null
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', 'T').replace('Z', 'Z')
const snapshotName = `${timestamp}-${mode}${label ? `-${label}` : ''}`
const snapshotDir = path.join(historyRoot, snapshotName)
fs.mkdirSync(snapshotDir, { recursive: true })

const resultFiles = [
  'frontend_navigation_results.json',
  'frontend_user_flows_results.json',
  'full_frontend_verification_after_metadata.json',
  'demo_auth_build_result.json',
  'build_startup_results.json',
  'supabase_query_inventory.json',
  'component_hotspot_inventory.json',
  'baseline_summary.json',
  'environment.json',
  'api_benchmark_results.json',
]

for (const file of fs.readdirSync(resultsDir).filter((file) => /^dev_server_memory_profile.*\.json$/.test(file))) {
  resultFiles.push(file)
}

const copiedFiles = []
for (const file of resultFiles) {
  const src = path.join(resultsDir, file)
  if (!fs.existsSync(src)) continue
  fs.copyFileSync(src, path.join(snapshotDir, file))
  copiedFiles.push(file)
}

const commandLogs = fs.existsSync(logsDir)
  ? fs.readdirSync(logsDir).filter((file) => /^(final|loop2|remediation|perf)-/.test(file)).sort().slice(-80)
  : []

const git = (...args) => {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' })
  return result.status === 0 ? result.stdout.trim() : null
}

const manifest = {
  timestamp: new Date().toISOString(),
  mode,
  label,
  snapshotDir: path.relative(root, snapshotDir),
  gitCommit: git('rev-parse', 'HEAD'),
  branch: git('branch', '--show-current'),
  dirty: Boolean(git('status', '--short')),
  copiedFiles,
  commandLogs,
  notes: [
    'Snapshot contains copies of current result JSON files only; raw logs/traces remain in the main performance ledger.',
    'No secret values are intentionally captured. Environment detail should stay limited to environment.json names/versions.',
  ],
}
fs.writeFileSync(path.join(snapshotDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log(JSON.stringify(manifest, null, 2))
