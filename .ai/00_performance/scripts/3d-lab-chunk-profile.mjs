import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const root = process.cwd()
const resultsDir = path.join(root, '.ai/00_performance/results')
fs.mkdirSync(resultsDir, { recursive: true })

const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=')
  return [key, rest.join('=') || 'true']
}))
const out = args.get('out') ?? path.join(resultsDir, '3d_lab_chunk_profile.json')

const routeFiles = [
  { route: '/dashboard/3d-lab', manifest: '.next/server/app/dashboard/3d-lab/page_client-reference-manifest.js', server: '.next/server/app/dashboard/3d-lab/page.js' },
  { route: '/dashboard/3d-lab/[moduleId]', manifest: '.next/server/app/dashboard/3d-lab/[moduleId]/page_client-reference-manifest.js', server: '.next/server/app/dashboard/3d-lab/[moduleId]/page.js' },
]

function parseManifest(file) {
  if (!fs.existsSync(file)) return null
  const text = fs.readFileSync(file, 'utf8')
  const match = text.match(/globalThis\.__RSC_MANIFEST\[[\s\S]+?\]\s*=\s*({[\s\S]*});\s*$/)
  if (!match) return null
  return JSON.parse(match[1])
}

function chunkPath(chunk) {
  let rel = chunk.replace(/^\/_next\//, '')
  if (rel.startsWith('static/')) return path.join(root, '.next', rel)
  if (rel.startsWith('server/')) return path.join(root, '.next', rel)
  return path.join(root, '.next', rel)
}

function fileBytes(file) {
  if (!fs.existsSync(file)) return { bytes: 0, gzipBytes: 0, exists: false }
  const buf = fs.readFileSync(file)
  return { bytes: buf.length, gzipBytes: zlib.gzipSync(buf).length, exists: true }
}

function profileRoute({ route, manifest, server }) {
  const manifestPath = path.join(root, manifest)
  const parsed = parseManifest(manifestPath)
  const clientModules = parsed?.clientModules ?? {}
  const entries = Object.entries(clientModules)
  const chunks = [...new Set(entries.flatMap(([, value]) => value?.chunks ?? []))]
  const chunkStats = chunks.map((chunk) => ({ chunk, file: path.relative(root, chunkPath(chunk)), ...fileBytes(chunkPath(chunk)) }))
  const signalPatterns = [
    'src/features/3d-lab',
    'config/modules',
    'config/registry',
    'ModuleViewer',
    'LabViewportFrame',
    'CanvasWrapper',
    '@react-three/fiber',
    '@react-three/drei',
    'three',
  ]
  const signalModules = entries
    .map(([moduleId, value]) => ({ moduleId, chunks: value?.chunks ?? [] }))
    .filter((entry) => signalPatterns.some((pattern) => entry.moduleId.includes(pattern)))
  const serverFile = path.join(root, server)
  const serverText = fs.existsSync(serverFile) ? fs.readFileSync(serverFile, 'utf8') : ''
  const serverSignals = signalPatterns.filter((pattern) => serverText.includes(pattern))
  return {
    route,
    manifest,
    manifestExists: fs.existsSync(manifestPath),
    moduleCount: entries.length,
    signalCount: signalModules.length,
    uniqueChunks: chunks.length,
    rawBytes: chunkStats.reduce((sum, stat) => sum + stat.bytes, 0),
    gzipBytes: chunkStats.reduce((sum, stat) => sum + stat.gzipBytes, 0),
    hasModuleViewer: entries.some(([id]) => id.includes('ModuleViewer')),
    hasLabViewportFrame: entries.some(([id]) => id.includes('LabViewportFrame')),
    hasCanvasWrapper: entries.some(([id]) => id.includes('CanvasWrapper')),
    hasR3F: entries.some(([id]) => id.includes('@react-three/fiber')),
    hasDrei: entries.some(([id]) => id.includes('@react-three/drei')),
    hasFullConfigModuleSignal: entries.some(([id]) => id.includes('config/modules')),
    signalModules,
    serverSignals,
    largestChunks: chunkStats.sort((a, b) => b.bytes - a.bytes).slice(0, 20),
  }
}

function sourceCounts() {
  const registryDir = path.join(root, 'src/features/3d-lab/config/registry')
  const moduleImportMatches = []
  if (fs.existsSync(registryDir)) {
    for (const file of fs.readdirSync(registryDir).filter((name) => /^cat-\d+\.ts$/.test(name))) {
      const rel = path.join('src/features/3d-lab/config/registry', file)
      const text = fs.readFileSync(path.join(root, rel), 'utf8')
      const matches = [...text.matchAll(/from ['"]@\/features\/3d-lab\/config\/modules\//g)]
      moduleImportMatches.push({ file: rel, count: matches.length, bytes: Buffer.byteLength(text) })
    }
  }
  const metadataFile = path.join(root, 'src/features/3d-lab/config/registry/metadata.ts')
  return {
    registryDirectConfigImports: moduleImportMatches.reduce((sum, item) => sum + item.count, 0),
    registryCategorySourceBytes: moduleImportMatches.reduce((sum, item) => sum + item.bytes, 0),
    categoryFiles: moduleImportMatches,
    metadataFileExists: fs.existsSync(metadataFile),
    metadataSourceBytes: fs.existsSync(metadataFile) ? fs.statSync(metadataFile).size : 0,
  }
}

const payload = {
  timestamp: new Date().toISOString(),
  source: '.next client reference manifests and src/features/3d-lab/config/registry source scan',
  routes: routeFiles.map(profileRoute),
  sourceCounts: sourceCounts(),
  notes: [
    'rawBytes/gzipBytes sum unique chunk files referenced by each route client-reference manifest.',
    'signalModules count modules matching 3D Lab, config, viewer, canvas, R3F/drei, or three substrings.',
    'serverSignals are substring checks in server route bundle, useful for import-shape drift but not byte totals.',
  ],
}

fs.writeFileSync(out, JSON.stringify(payload, null, 2) + '\n')
console.log(`Wrote ${out}`)
