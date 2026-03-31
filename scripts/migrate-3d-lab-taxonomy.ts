#!/usr/bin/env bun
/**
 * scripts/migrate-3d-lab-taxonomy.ts
 *
 * 3D Lab taxonomy migration script.
 *
 * What it does:
 *   1. Creates 18 sub-folders inside _config/modules/ (01-structural/, 02-envelope/, etc.)
 *   2. Moves each of the 187 .ts module config files into the correct category folder
 *   3. Creates 18 segmented registry files in _config/registry/ (cat-01.ts, cat-02.ts, etc.)
 *   4. Updates the import path in each moved module file
 *      (../../_types/templates → ../../../_types/templates)
 *
 * Safe to run multiple times (idempotent).
 *
 * Usage:
 *   bun scripts/migrate-3d-lab-taxonomy.ts
 *   bun scripts/migrate-3d-lab-taxonomy.ts --dry-run
 */

import fs from 'fs'
import path from 'path'

// ─── Config ──────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run')

const ROOT = path.resolve(import.meta.dir, '..')
const MODULES_DIR = path.join(ROOT, 'src/app/dashboard/3d-lab/_config/modules')
const REGISTRY_DIR = path.join(ROOT, 'src/app/dashboard/3d-lab/_config/registry')

// ─── Category Definitions ────────────────────────────────────────────────────

const CATEGORIES: Record<string, { id: string; folder: string; label: string; phase: 1 | 2 | 3 }> = {
  STRUCTURAL: { id: '01', folder: '01-structural',  label: 'Structural & Framing',            phase: 1 },
  ENVELOPE:   { id: '02', folder: '02-envelope',    label: 'Building Envelope',               phase: 2 },
  GLAZING:    { id: '03', folder: '03-glazing',     label: 'Glazing & Fenestration',          phase: 2 },
  HARDWARE:   { id: '04', folder: '04-hardware',    label: 'Architectural Hardware',          phase: 3 },
  HVAC:       { id: '05', folder: '05-hvac',        label: 'Mechanical & HVAC',               phase: 2 },
  PLUMBING:   { id: '06', folder: '06-plumbing',    label: 'Plumbing & Sanitary',             phase: 1 },
  FIRE:       { id: '07', folder: '07-fire',        label: 'Fire Protection',                 phase: 2 },
  ELECTRICAL: { id: '08', folder: '08-electrical',  label: 'Electrical Power',                phase: 2 },
  AUXILIARY:  { id: '09', folder: '09-auxiliary',   label: 'Auxiliary Systems',               phase: 2 },
  FINISHES:   { id: '10', folder: '10-finishes',    label: 'Architectural Finishes',          phase: 1 },
  CIVIL:      { id: '11', folder: '11-civil',       label: 'Civil & Site Development',        phase: 3 },
  WOODCRAFT:  { id: '12', folder: '12-woodcraft',   label: 'Woodcraft & Joinery',             phase: 3 },
  MILLWORK:   { id: '13', folder: '13-millwork',    label: 'Millwork & Cabinetry',            phase: 3 },
  STAIRS:     { id: '14', folder: '14-stairs',      label: 'Stairs & Vertical Circulation',   phase: 1 },
  HERITAGE:   { id: '15', folder: '15-heritage',    label: 'Philippine Vernacular & Heritage',phase: 1 },
  MASONRY:    { id: '16', folder: '16-masonry',     label: 'Masonry & Stonework',             phase: 3 },
  CONCRETE:   { id: '17', folder: '17-concrete',    label: 'Specialized Concrete',            phase: 3 },
  TOPOGRAPHY: { id: '18', folder: '18-topography',  label: 'Topography & Landscape',          phase: 3 },
}

// ─── Full Module Mapping ──────────────────────────────────────────────────────
// Derived from moduleRegistry.ts subject fields + per-module overrides.
// Format: moduleId → CategoryKey

const MODULE_CATEGORY_MAP: Record<string, keyof typeof CATEGORIES> = {
  // ── PD 1096 — STAIRS overrides ──────────────────────────────────────────
  'stairway-configurator':        'STAIRS',
  'handrail-requirements':        'STAIRS',
  'escalator-section':            'STAIRS',
  'stairwell-enclosure':          'STAIRS',

  // ── PD 1096 — AUXILIARY overrides ───────────────────────────────────────
  'elevator-dimensions':          'AUXILIARY',  // bp-344 subject but elevator → AUXILIARY
  'elevator-hoistway':            'AUXILIARY',  // pmec subject

  // ── PD 1096 — GLAZING overrides ─────────────────────────────────────────
  'skylight-requirements':        'GLAZING',
  'light-ventilation-openings':   'GLAZING',
  'natural-ventilation-rules':    'GLAZING',
  'cross-ventilation-analysis':   'GLAZING',   // pmec subject

  // ── PD 1096 — CIVIL overrides ───────────────────────────────────────────
  'parking-layout':               'CIVIL',
  'parking-slot-dimensions':      'CIVIL',
  'carport-abutment-rules':       'CIVIL',

  // ── PD 1096 — ENVELOPE (explicit, all remaining pd-1096 defaults) ───────
  'building-height-limits':       'ENVELOPE',
  'building-typology-residential':'ENVELOPE',
  'building-typology-commercial': 'ENVELOPE',
  'building-typology-institutional': 'ENVELOPE',
  'construction-types-comparison':'ENVELOPE',
  'occupancy-classification':     'ENVELOPE',
  'occupant-load-calculator':     'ENVELOPE',
  'mixed-occupancy-separator':    'ENVELOPE',
  'corridor-width-calculator':    'ENVELOPE',
  'room-size-minimums':           'ENVELOPE',
  'ceiling-height-configurator':  'ENVELOPE',
  'mezzanine-clearances':         'ENVELOPE',
  'court-requirements':           'ENVELOPE',
  'attic-requirements':           'ENVELOPE',
  'open-space-requirements':      'ENVELOPE',
  'nbcp-envelope':                'ENVELOPE',
  'exit-door-mechanics':          'ENVELOPE',
  'exit-width-calculator':        'ENVELOPE',
  'balcony-guardrail':            'ENVELOPE',
  // Remaining pd-1096 defaults
  'development-controls-pso':     'ENVELOPE',
  'vent-shaft-dimensions':        'ENVELOPE',
  'firewall-construction':        'ENVELOPE',
  'fire-resistance-ratings':      'ENVELOPE',
  'ramp-gradient-building':       'ENVELOPE',
  'garage-ventilation':           'ENVELOPE',

  // ── RA 9514 (Fire Code) → FIRE ───────────────────────────────────────────
  'fire-travel-distance':         'FIRE',
  'fire-exit-layout':             'FIRE',
  'fire-zone-classification':     'FIRE',
  'sprinkler-layout':             'FIRE',
  'fire-suppression-overview':    'FIRE',
  'smoke-control-systems':        'FIRE',
  'fire-detection-layout':        'FIRE',
  'standpipe-classes':            'FIRE',
  'fire-alarm-system':            'FIRE',
  'fire-extinguisher-placement':  'FIRE',
  'emergency-lighting-layout':    'FIRE',
  'refuge-area-design':           'FIRE',
  'smoke-partition-requirements': 'FIRE',
  'fire-door-ratings':            'FIRE',
  'horizontal-exit-design':       'FIRE',

  // ── BP 344 (Accessibility) → FINISHES ────────────────────────────────────
  'ramp-accessible-toilet':       'FINISHES',
  'accessible-parking':           'FINISHES',
  'wheelchair-maneuvering':       'FINISHES',
  'accessible-toilet-detailed':   'FINISHES',
  'tactile-block-types':          'FINISHES',
  'accessible-door-clearances':   'FINISHES',
  'accessible-elevator-cab':      'FINISHES',
  'ramp-tactile-warnings':        'FINISHES',
  'accessible-signage':           'FINISHES',
  'accessible-counter-heights':   'FINISHES',
  'accessible-corridor-widths':   'FINISHES',
  'accessible-bathing':           'FINISHES',
  'accessible-stair-handrails':   'FINISHES',

  // ── History → HERITAGE (all go here per instructions) ────────────────────
  'classical-orders-comparison':  'HERITAGE',
  'bahay-na-bato':                'HERITAGE',
  'gothic-ribbed-vault':          'HERITAGE',
  'bahay-kubo':                   'HERITAGE',
  'tuscan-order':                 'HERITAGE',
  'doric-order':                  'HERITAGE',
  'ionic-order':                  'HERITAGE',
  'corinthian-order':             'HERITAGE',
  'composite-order':              'HERITAGE',
  'superposition-demo':           'HERITAGE',
  'colossal-order':               'HERITAGE',
  'egyptian-post-lintel':         'HERITAGE',
  'greek-peristyle-temple':       'HERITAGE',
  'roman-arch-vault':             'HERITAGE',
  'byzantine-pendentive':         'HERITAGE',
  'romanesque-barrel-vault':      'HERITAGE',
  'gothic-structural-system':     'HERITAGE',
  'renaissance-dome-construction':'HERITAGE',
  'modernism-five-points':        'HERITAGE',
  'contemporary-parametric':      'HERITAGE',
  'pantheon-cutaway':             'HERITAGE',
  'hagia-sophia-section':         'HERITAGE',
  'notre-dame-section':           'HERITAGE',
  'florence-cathedral-dome':      'HERITAGE',
  'guggenheim-bilbao':            'HERITAGE',
  'earthquake-baroque-church':    'HERITAGE',
  'vigan-heritage-house':         'HERITAGE',
  'art-deco-manila':              'HERITAGE',
  'locsin-cultural-center':       'HERITAGE',
  'manila-cathedral-section':     'HERITAGE',
  'ifugao-house':                 'HERITAGE',
  'ivatan-stone-house':           'HERITAGE',
  'san-agustin-church':           'HERITAGE',

  // ── NSCP (Structural) → STRUCTURAL ───────────────────────────────────────
  'structural-load-path':         'STRUCTURAL',
  'seismic-parameter-map':        'STRUCTURAL',
  'beam-stress-diagram':          'STRUCTURAL',
  'column-interaction-diagram':   'STRUCTURAL',
  'lrfd-load-combinations':       'STRUCTURAL',
  'dead-live-load-toggles':       'STRUCTURAL',
  'soil-profile-cutaway':         'STRUCTURAL',
  'wind-load-analysis':           'STRUCTURAL',
  'rc-cover-requirements':        'STRUCTURAL',
  'rebar-sizes-catalog':          'STRUCTURAL',
  'steel-connections':            'STRUCTURAL',
  'structural-systems-comparison':'STRUCTURAL',
  'concrete-density-values':      'STRUCTURAL',
  'near-source-factors':          'STRUCTURAL',
  'seismic-zone-map':             'STRUCTURAL',
  'base-shear-calculator':        'STRUCTURAL',

  // ── NPCP (Plumbing) → PLUMBING ───────────────────────────────────────────
  'plumbing-fixture-cutaway':     'PLUMBING',
  'drainage-system-cutaway':      'PLUMBING',
  'water-supply-riser':           'PLUMBING',
  'pipe-slope-visualization':     'PLUMBING',
  'septic-tank-design':           'PLUMBING',
  'backflow-prevention':          'PLUMBING',
  'fixture-unit-values':          'PLUMBING',
  'trap-seal-depth':              'PLUMBING',
  'vent-pipe-routing':            'PLUMBING',
  'grease-trap-detail':           'PLUMBING',
  'water-meter-assembly':         'PLUMBING',
  'building-sewer-minimum':       'PLUMBING',
  'hot-water-system':             'PLUMBING',
  'storm-drainage-system':        'PLUMBING',

  // ── PEC (Electrical) → ELECTRICAL ────────────────────────────────────────
  'panel-board-layout':           'ELECTRICAL',
  'lighting-layout':              'ELECTRICAL',
  'grounding-system':             'ELECTRICAL',
  'outlet-spacing-room':          'ELECTRICAL',
  'mounting-heights':             'ELECTRICAL',
  'circuit-conductor-sizing':     'ELECTRICAL',
  'illumination-levels':          'ELECTRICAL',
  'gfci-protection-zones':        'ELECTRICAL',
  'emergency-power-system':       'ELECTRICAL',
  'electrical-room-context':      'ELECTRICAL',

  // ── PMEC (Mechanical/HVAC) → HVAC ────────────────────────────────────────
  'hvac-duct-layout':             'HVAC',
  'split-ac-cutaway':             'HVAC',
  'air-changes-per-hour':         'HVAC',
  'machine-room-layout':          'HVAC',
  'refrigeration-cycle':          'HVAC',

  // ── Materials — MASONRY overrides ────────────────────────────────────────
  'chb-block-types':              'MASONRY',
  'bond-pattern-comparison':      'MASONRY',
  'mortar-joint-types':           'MASONRY',

  // ── Materials — FINISHES overrides ───────────────────────────────────────
  'plastering-layers':            'FINISHES',
  'wall-types-comparison':        'FINISHES',

  // ── Materials — WOODCRAFT override ───────────────────────────────────────
  'lumber-sizes':                 'WOODCRAFT',

  // ── Materials — STRUCTURAL (concrete, rebar, steel, formwork, etc.) ──────
  'construction-sequence-foundation': 'STRUCTURAL',
  'concrete-mix-proportions':     'STRUCTURAL',
  'wall-section-assembly':        'STRUCTURAL',
  'standard-material-sheets':     'STRUCTURAL',
  'rebar-catalog':                'STRUCTURAL',
  'steel-sections-catalog':       'STRUCTURAL',
  'waterproofing-systems':        'STRUCTURAL',
  'concrete-aggregate-visualizer':'STRUCTURAL',

  // ── Construction → STRUCTURAL ────────────────────────────────────────────
  'foundation-types':             'STRUCTURAL',
  'roof-truss-fink':              'STRUCTURAL',
  'roof-truss-pratt':             'STRUCTURAL',
  'roof-truss-howe':              'STRUCTURAL',
  'roof-truss-warren':            'STRUCTURAL',
  'roof-truss-king-post':         'STRUCTURAL',
  'roof-truss-queen-post':        'STRUCTURAL',
  'column-construction-sequence': 'STRUCTURAL',
  'beam-construction-sequence':   'STRUCTURAL',
  'slab-construction-sequence':   'STRUCTURAL',
  'chb-wall-construction':        'MASONRY',   // construction subject but CHB → MASONRY
  'formwork-assembly':            'STRUCTURAL',
  'lintel-over-opening':          'STRUCTURAL',

  // ── Specs → FINISHES ─────────────────────────────────────────────────────
  'csi-masterformat-explorer':    'FINISHES',
  'door-schedule-configurator':   'FINISHES',

  // ── Estimating → CIVIL ───────────────────────────────────────────────────
  'quantity-takeoff-room':        'CIVIL',
  'earthwork-volume':             'CIVIL',

  // ── Professional Practice → CIVIL ────────────────────────────────────────
  'project-delivery-methods':     'CIVIL',
  'contract-document-hierarchy':  'CIVIL',

  // ── Planning → CIVIL ─────────────────────────────────────────────────────
  // Note: building-typology-* are in planning subject but map to ENVELOPE (already declared above)
  'zoning-setback-overlay':       'CIVIL',
  'site-circulation-analysis':    'CIVIL',
  'clup-zoning-overlay':          'CIVIL',
  'subdivision-layout-pd957':     'CIVIL',
  'subdivision-layout-bp220':     'CIVIL',
  'pd957-vs-bp220-comparison':    'CIVIL',

  // ── Housing → CIVIL ──────────────────────────────────────────────────────
  'water-code-easements':         'CIVIL',
  'shoreline-setback':            'CIVIL',
  'fault-line-setback':           'CIVIL',
  'housing-open-space':           'CIVIL',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg: string) {
  console.log(msg)
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    if (!DRY_RUN) fs.mkdirSync(dir, { recursive: true })
    log(`  [mkdir] ${path.relative(ROOT, dir)}`)
  }
}

function moveFile(src: string, dest: string) {
  if (src === dest) return
  if (!DRY_RUN) fs.renameSync(src, dest)
  log(`  [move]  ${path.relative(ROOT, src)} → ${path.relative(ROOT, dest)}`)
}

function updateImportPaths(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8')
  // Pattern: import ... from '../../_types/templates' (or with aliases)
  // After moving one level deeper, needs ../../../_types/templates
  const updated = content.replace(
    /from ['"]\.\.\/\.\.\/(_types\/[^'"]+)['"]/g,
    "from '../../../$1'"
  )
  if (updated !== content) {
    if (!DRY_RUN) fs.writeFileSync(filePath, updated, 'utf8')
    log(`  [patch] updated import paths in ${path.basename(filePath)}`)
    return true
  }
  return false
}

function writeFile(filePath: string, content: string) {
  if (!DRY_RUN) fs.writeFileSync(filePath, content, 'utf8')
  log(`  [write] ${path.relative(ROOT, filePath)}`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  if (DRY_RUN) {
    log('─── DRY RUN MODE — no files will be written ───────────────────────────────')
  }

  // Verify source directory exists
  if (!fs.existsSync(MODULES_DIR)) {
    console.error(`ERROR: modules directory not found: ${MODULES_DIR}`)
    process.exit(1)
  }

  // Get all .ts files in the flat modules directory (not in sub-folders yet)
  const allFiles = fs.readdirSync(MODULES_DIR, { withFileTypes: true })
  const flatFiles = allFiles
    .filter(f => f.isFile() && f.name.endsWith('.ts'))
    .map(f => f.name.replace(/\.ts$/, ''))

  // Check for any module IDs in files that are not in our map
  const unmapped: string[] = []
  for (const moduleId of flatFiles) {
    if (!(moduleId in MODULE_CATEGORY_MAP)) {
      unmapped.push(moduleId)
    }
  }
  if (unmapped.length > 0) {
    console.warn(`\nWARNING: ${unmapped.length} module file(s) not in category map — will be SKIPPED:`)
    unmapped.forEach(id => console.warn(`  - ${id}`))
    console.warn('')
  }

  // Step 1: Create all 18 category sub-folders
  log('\n── Step 1: Creating category sub-folders ────────────────────────────────────')
  ensureDir(REGISTRY_DIR)
  for (const cat of Object.values(CATEGORIES)) {
    ensureDir(path.join(MODULES_DIR, cat.folder))
  }

  // Step 2: Move module files into their category folders + update imports
  log('\n── Step 2: Moving module files & updating import paths ──────────────────────')
  const moved: Record<string, string[]> = {}
  for (const [catKey] of Object.entries(CATEGORIES)) {
    moved[catKey] = []
  }

  for (const moduleId of flatFiles) {
    const catKey = MODULE_CATEGORY_MAP[moduleId]
    if (!catKey) continue // already warned above

    const cat = CATEGORIES[catKey]
    const srcPath = path.join(MODULES_DIR, `${moduleId}.ts`)
    const destPath = path.join(MODULES_DIR, cat.folder, `${moduleId}.ts`)

    // If already in the right folder, skip move but still check import paths
    if (fs.existsSync(destPath) && srcPath !== destPath) {
      log(`  [skip]  ${moduleId}.ts already in ${cat.folder}/`)
      moved[catKey].push(moduleId)
      // Still patch imports in case this is a re-run after a partial migration
      updateImportPaths(destPath)
      continue
    }

    moveFile(srcPath, destPath)
    if (!DRY_RUN) {
      updateImportPaths(destPath)
    }
    moved[catKey].push(moduleId)
  }

  // Step 3: Generate cat-XX.ts registry files
  log('\n── Step 3: Generating segmented registry files ──────────────────────────────')
  for (const [catKey, cat] of Object.entries(CATEGORIES)) {
    const modules = moved[catKey] ?? []
    const registryPath = path.join(REGISTRY_DIR, `cat-${cat.id}.ts`)

    const importLines = modules
      .sort()
      .map(id => {
        // camelCase the id for the import binding
        const binding = id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
        return `import { ${binding} } from '../modules/${cat.folder}/${id}'`
      })
      .join('\n')

    const entryLines = modules
      .sort()
      .map(id => {
        const binding = id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
        return `  { ...${binding}, categoryId: '${cat.id}', launchPhase: ${cat.phase} },`
      })
      .join('\n')

    const content = `// src/app/dashboard/3d-lab/_config/registry/cat-${cat.id}.ts
// ─── Category ${cat.id}: ${cat.label} ─────────────────────────────────────────
// Auto-generated by scripts/migrate-3d-lab-taxonomy.ts — do not edit manually.

import type { ModuleRegistryEntry } from '../../_types/templates'
${modules.length > 0 ? '\n' + importLines + '\n' : ''}
export const cat${cat.id}Modules: ModuleRegistryEntry[] = [
${entryLines}
]
`
    writeFile(registryPath, content)
  }

  // Step 4: Generate master registry index
  log('\n── Step 4: Generating master registry index ─────────────────────────────────')
  const indexPath = path.join(REGISTRY_DIR, 'index.ts')
  const importAllLines = Object.values(CATEGORIES)
    .map(cat => `import { cat${cat.id}Modules } from './cat-${cat.id}'`)
    .join('\n')
  const spreadLines = Object.values(CATEGORIES)
    .map(cat => `  ...cat${cat.id}Modules,`)
    .join('\n')

  const indexContent = `// src/app/dashboard/3d-lab/_config/registry/index.ts
// ─── Master Module Registry (taxonomy-aware) ──────────────────────────────────
// Auto-generated by scripts/migrate-3d-lab-taxonomy.ts — do not edit manually.

import type { ModuleRegistryEntry } from '../../_types/templates'
${importAllLines}

export const ALL_MODULES: ModuleRegistryEntry[] = [
${spreadLines}
]

export {
${Object.values(CATEGORIES).map(cat => `  cat${cat.id}Modules,`).join('\n')}
}
`
  writeFile(indexPath, indexContent)

  // ─── Summary Table ──────────────────────────────────────────────────────────
  log('\n── Summary ──────────────────────────────────────────────────────────────────')
  log(`${'Category'.padEnd(12)} ${'ID'.padEnd(4)} ${'Folder'.padEnd(22)} ${'Phase'.padEnd(7)} Count`)
  log('─'.repeat(65))

  let total = 0
  for (const [catKey, cat] of Object.entries(CATEGORIES)) {
    const count = (moved[catKey] ?? []).length
    total += count
    log(
      `${catKey.padEnd(12)} ${cat.id.padEnd(4)} ${cat.folder.padEnd(22)} ${String(cat.phase).padEnd(7)} ${count}`
    )
  }
  log('─'.repeat(65))
  log(`${'TOTAL'.padEnd(12)} ${' '.padEnd(4)} ${' '.padEnd(22)} ${' '.padEnd(7)} ${total}`)

  const skipped = flatFiles.filter(id => !(id in MODULE_CATEGORY_MAP)).length
  if (skipped > 0) {
    log(`\nSkipped (unmapped): ${skipped} file(s)`)
  }

  log(`\n${DRY_RUN ? '✓ Dry run complete. Re-run without --dry-run to apply.' : '✓ Migration complete.'}`)
}

main()
