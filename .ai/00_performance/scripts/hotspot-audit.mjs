import path from 'node:path'
import { readFileSync } from 'node:fs'
import { ensurePerfDirs, repoPath, RESULTS_DIR, rel, safeJsonFile, walk, writeMarkdown } from './perf-utils.mjs'

ensurePerfDirs()
const files = walk(repoPath('src'), { include: (file) => /\.(ts|tsx|js|jsx)$/.test(file) })
const findings = []
const categories = {
  clientComponent: /['"]use client['"]/,
  broadContext: /createContext\(|<.*Provider|useContext\(/,
  renderArrayWork: /\.(map|filter|sort|reduce)\(/,
  clientSorting: /\.sort\(/,
  clientFiltering: /\.filter\(/,
  expensiveFormatting: /new Intl\.|toLocale(Date|String|TimeString)|format\(/,
  regexConstruction: /new RegExp\(|\/[^\n/]+\/[gimsuy]*/,
  dynamicImportCandidate: /from ['"](three|@react-three\/fiber|@react-three\/drei|framer-motion|recharts|mermaid|@tiptap|@uiw\/react-codemirror|fuse\.js|papaparse|marked)['"]|import\(['"](three|@react-three\/fiber|@react-three\/drei|framer-motion|recharts|mermaid|@tiptap|@uiw\/react-codemirror|fuse\.js|papaparse|marked)/,
  useEffectFetch: /useEffect\([\s\S]{0,500}(fetch\(|createClient\(|\.from\()/,
  stateStormCandidate: /useState\(|set[A-Z][A-Za-z]+\(/,
  unboundedList: /\.map\([^)]*=>[\s\S]{0,200}<[^>]+>/,
  r3fHeavy: /@react-three|three\b|Canvas\b|useFrame\(|BufferGeometry|instancedMesh/,
  imageRisk: /<img\b|next\/image|Image\s+src=/,
  sequentialAwait: /await[\s\S]{0,180}\n[\s\S]{0,80}await/,
  jsonSerialization: /JSON\.(parse|stringify)\(/,
}

for (const file of files) {
  const text = readFileSync(file, 'utf8')
  const lineCount = text.split(/\r?\n/).length
  const isRoute = /src\/app\/.+\/(page|layout)\.(tsx|ts)$/.test(rel(file))
  for (const [category, regex] of Object.entries(categories)) {
    if (!regex.test(text)) continue
    const lines = []
    text.split(/\r?\n/).forEach((line, idx) => {
      if (new RegExp(regex).test(line) && lines.length < 8) lines.push({ line: idx + 1, code: line.trim().slice(0, 220) })
    })
    findings.push({ file: rel(file), category, lineCount, isRoute, examples: lines })
  }
}

const byCategory = Object.fromEntries(Object.keys(categories).map((category) => [category, findings.filter((f) => f.category === category).length]))
const largeFiles = files.map((file) => ({ file: rel(file), lines: readFileSync(file, 'utf8').split(/\r?\n/).length })).sort((a, b) => b.lines - a.lines).slice(0, 80)
const clientFiles = findings.filter((f) => f.category === 'clientComponent').map((f) => f.file)
const heavyImportFindings = findings.filter((f) => f.category === 'dynamicImportCandidate' || f.category === 'r3fHeavy')

const result = {
  timestamp: new Date().toISOString(),
  scannedFiles: files.length,
  byCategory,
  largeFiles,
  findings,
  notes: [
    'Static hotspot findings are risk signals, not proof of runtime slowness.',
    'Use Playwright traces/browser profiling or React Profiler to validate high-impact findings before optimization.',
  ],
}

safeJsonFile(path.join(RESULTS_DIR, 'component_hotspot_inventory.json'), result)

const catRows = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([category, count]) => `| ${category} | ${count} |`).join('\n')
const largeRows = largeFiles.slice(0, 30).map((f) => `| \`${f.file}\` | ${f.lines} |`).join('\n')
const heavyRows = heavyImportFindings.slice(0, 80).map((f) => `| \`${f.file}\` | ${f.category} | ${f.examples[0]?.line ?? ''} | \`${(f.examples[0]?.code ?? '').replace(/\|/g, '\\|')}\` |`).join('\n')
const sequentialRows = findings.filter((f) => f.category === 'sequentialAwait').slice(0, 80).map((f) => `| \`${f.file}\` | ${f.examples[0]?.line ?? ''} |`).join('\n')

writeMarkdown(path.join(process.cwd(), '.ai/00_performance/11_component_function_hotspots.md'), `# 11 — Component, Function, and Hotspot Audit

Generated: ${result.timestamp}

## Method
Static scan of \`src/**/*.ts(x)\` for render-heavy patterns, expensive imports, list operations, context/provider breadth, sequential awaits, JSON serialization, image/3D risks, and client-component signals. These are **risk signals** until paired with runtime trace evidence.

## Summary by hotspot category
| Category | File count/signals |
| --- | ---: |
${catRows}

## Largest source files by line count
| File | Lines |
| --- | ---: |
${largeRows}

## Heavy import / bundle-risk signals
| File | Category | Line | Example |
| --- | --- | ---: | --- |
${heavyRows || '| none detected | | | |'}

## Sequential-await candidates
Sequential awaits can create server/API waterfalls. Validate dependencies before changing.

| File | First signal line |
| --- | ---: |
${sequentialRows || '| none detected | |'}

## Key static risks to validate with measurements
- Large client-heavy files and provider/context files may cause broad rerender costs.
- 3D/R3F, charting, rich text, markdown, Mermaid, and CodeMirror imports are likely bundle/runtime hotspots when pulled into initial routes.
- Client-side array sorting/filtering and unbounded maps should be checked against real data sizes.
- Sequential awaits in server actions/API handlers should be reviewed for safe parallelization.
- Image and canvas-heavy surfaces need route-specific network and rendering traces.

## Raw evidence
- \`.ai/00_performance/results/component_hotspot_inventory.json\`
`)
