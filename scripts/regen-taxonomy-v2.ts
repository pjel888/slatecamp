#!/usr/bin/env bun
/**
 * scripts/regen-taxonomy-v2.ts
 *
 * Regenerates the 3D Lab registry files for the revised 16-category
 * LEA-aligned taxonomy. Reads actual export names from module files
 * to avoid import mismatches.
 *
 * Steps:
 *   1. Creates 16 category sub-folders in _config/modules/
 *   2. Moves module .ts files from old category folders to new ones
 *   3. Updates import paths in moved files
 *   4. Generates 16 cat-XX.ts registry files with correct imports
 *   5. Generates registry/index.ts master file
 *
 * Usage:
 *   bun scripts/regen-taxonomy-v2.ts
 *   bun scripts/regen-taxonomy-v2.ts --dry-run
 */

import fs from 'fs'
import path from 'path'

const DRY_RUN = process.argv.includes('--dry-run')
const ROOT = path.resolve(import.meta.dir, '..')
const BASE = path.join(ROOT, 'src/app/dashboard/3d-lab/_config')
const MODULES_DIR = path.join(BASE, 'modules')
const REGISTRY_DIR = path.join(BASE, 'registry')

// ─── 16 Categories ──────────────────────────────────────────────────────────

interface CatDef {
  id: string
  folder: string
  label: string
  phase: 1 | 2 | 3
  key: string
}

const CATEGORIES: CatDef[] = [
  { id: '01', folder: '01-building-code',  label: 'PD 1096: National Building Code',    phase: 1, key: 'BUILDING_CODE' },
  { id: '02', folder: '02-accessibility',  label: 'BP 344: Accessibility Law',          phase: 1, key: 'ACCESSIBILITY' },
  { id: '03', folder: '03-fire-code',      label: 'RA 9514: Fire Code & Life Safety',   phase: 1, key: 'FIRE_CODE' },
  { id: '04', folder: '04-structural',     label: 'NSCP: Structural Engineering',       phase: 1, key: 'STRUCTURAL' },
  { id: '05', folder: '05-plumbing',       label: 'NPCP: Plumbing Code',                phase: 1, key: 'PLUMBING' },
  { id: '06', folder: '06-electrical',     label: 'PEC: Electrical Code',               phase: 2, key: 'ELECTRICAL' },
  { id: '07', folder: '07-mechanical',     label: 'PMEC: Mechanical Code',              phase: 2, key: 'MECHANICAL' },
  { id: '08', folder: '08-vertical',       label: 'Vertical Circulation & Transport',   phase: 2, key: 'VERTICAL' },
  { id: '09', folder: '09-construction',   label: 'Construction Methods & Sequences',   phase: 2, key: 'CONSTRUCTION' },
  { id: '10', folder: '10-materials',      label: 'Building Materials',                 phase: 2, key: 'MATERIALS' },
  { id: '11', folder: '11-arch-history',   label: 'History of Architecture',            phase: 1, key: 'ARCH_HISTORY' },
  { id: '12', folder: '12-ph-heritage',    label: 'Philippine Vernacular & Heritage',   phase: 1, key: 'PH_HERITAGE' },
  { id: '13', folder: '13-planning',       label: 'Urban Planning, Zoning & Housing',   phase: 2, key: 'PLANNING' },
  { id: '14', folder: '14-prof-practice',  label: 'Professional Practice & Specs',      phase: 3, key: 'PROF_PRACTICE' },
  { id: '15', folder: '15-estimating',     label: 'Estimating & Quantity Surveying',    phase: 3, key: 'ESTIMATING' },
  { id: '16', folder: '16-site-dev',       label: 'Site Development & Parking',         phase: 3, key: 'SITE_DEV' },
]

const CAT_BY_KEY = Object.fromEntries(CATEGORIES.map(c => [c.key, c]))

// ─── Module → Category Mapping (all 187) ────────────────────────────────────

const MODULE_MAP: Record<string, string> = {
  // ── 01 BUILDING_CODE (PD 1096 core provisions) ────────────────────────────
  'nbcp-envelope':                'BUILDING_CODE',
  'building-height-limits':       'BUILDING_CODE',
  'occupancy-classification':     'BUILDING_CODE',
  'occupant-load-calculator':     'BUILDING_CODE',
  'mixed-occupancy-separator':    'BUILDING_CODE',
  'corridor-width-calculator':    'BUILDING_CODE',
  'room-size-minimums':           'BUILDING_CODE',
  'ceiling-height-configurator':  'BUILDING_CODE',
  'mezzanine-clearances':         'BUILDING_CODE',
  'court-requirements':           'BUILDING_CODE',
  'attic-requirements':           'BUILDING_CODE',
  'open-space-requirements':      'BUILDING_CODE',
  'development-controls-pso':     'BUILDING_CODE',
  'vent-shaft-dimensions':        'BUILDING_CODE',
  'exit-door-mechanics':          'BUILDING_CODE',
  'exit-width-calculator':        'BUILDING_CODE',
  'balcony-guardrail':            'BUILDING_CODE',
  'ramp-gradient-building':       'BUILDING_CODE',
  'skylight-requirements':        'BUILDING_CODE',
  'light-ventilation-openings':   'BUILDING_CODE',
  'natural-ventilation-rules':    'BUILDING_CODE',
  'garage-ventilation':           'BUILDING_CODE',
  'mounting-heights':             'BUILDING_CODE',

  // ── 02 ACCESSIBILITY (BP 344) ─────────────────────────────────────────────
  'ramp-accessible-toilet':       'ACCESSIBILITY',
  'accessible-parking':           'ACCESSIBILITY',
  'wheelchair-maneuvering':       'ACCESSIBILITY',
  'accessible-toilet-detailed':   'ACCESSIBILITY',
  'tactile-block-types':          'ACCESSIBILITY',
  'accessible-door-clearances':   'ACCESSIBILITY',
  'accessible-elevator-cab':      'ACCESSIBILITY',
  'ramp-tactile-warnings':        'ACCESSIBILITY',
  'accessible-signage':           'ACCESSIBILITY',
  'accessible-counter-heights':   'ACCESSIBILITY',
  'accessible-corridor-widths':   'ACCESSIBILITY',
  'accessible-bathing':           'ACCESSIBILITY',
  'accessible-stair-handrails':   'ACCESSIBILITY',

  // ── 03 FIRE_CODE (RA 9514 + PD 1096 fire provisions) ─────────────────────
  'fire-travel-distance':         'FIRE_CODE',
  'fire-exit-layout':             'FIRE_CODE',
  'fire-zone-classification':     'FIRE_CODE',
  'sprinkler-layout':             'FIRE_CODE',
  'fire-suppression-overview':    'FIRE_CODE',
  'smoke-control-systems':        'FIRE_CODE',
  'fire-detection-layout':        'FIRE_CODE',
  'standpipe-classes':            'FIRE_CODE',
  'fire-alarm-system':            'FIRE_CODE',
  'fire-extinguisher-placement':  'FIRE_CODE',
  'emergency-lighting-layout':    'FIRE_CODE',
  'refuge-area-design':           'FIRE_CODE',
  'smoke-partition-requirements': 'FIRE_CODE',
  'fire-door-ratings':            'FIRE_CODE',
  'horizontal-exit-design':       'FIRE_CODE',
  'firewall-construction':        'FIRE_CODE',
  'fire-resistance-ratings':      'FIRE_CODE',
  'construction-types-comparison':'FIRE_CODE',
  'stairwell-enclosure':          'FIRE_CODE',

  // ── 04 STRUCTURAL (NSCP) ─────────────────────────────────────────────────
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
  'superposition-demo':           'STRUCTURAL',

  // ── 05 PLUMBING (NPCP) ───────────────────────────────────────────────────
  'plumbing-fixture-cutaway':     'PLUMBING',
  'drainage-system-cutaway':      'PLUMBING',
  'water-supply-riser':           'PLUMBING',
  'septic-tank-design':           'PLUMBING',
  'fixture-unit-values':          'PLUMBING',
  'pipe-slope-visualization':     'PLUMBING',
  'backflow-prevention':          'PLUMBING',
  'trap-seal-depth':              'PLUMBING',
  'hot-water-system':             'PLUMBING',
  'water-meter-assembly':         'PLUMBING',
  'grease-trap-detail':           'PLUMBING',
  'vent-pipe-routing':            'PLUMBING',
  'building-sewer-minimum':       'PLUMBING',
  'storm-drainage-system':        'PLUMBING',

  // ── 06 ELECTRICAL (PEC) ──────────────────────────────────────────────────
  'panel-board-layout':           'ELECTRICAL',
  'grounding-system':             'ELECTRICAL',
  'outlet-spacing-room':          'ELECTRICAL',
  'lighting-layout':              'ELECTRICAL',
  'illumination-levels':          'ELECTRICAL',
  'circuit-conductor-sizing':     'ELECTRICAL',
  'gfci-protection-zones':        'ELECTRICAL',
  'emergency-power-system':       'ELECTRICAL',
  'electrical-room-context':      'ELECTRICAL',
  'elevator-dimensions':          'ELECTRICAL',

  // ── 07 MECHANICAL (PMEC) ─────────────────────────────────────────────────
  'hvac-duct-layout':             'MECHANICAL',
  'split-ac-cutaway':             'MECHANICAL',
  'air-changes-per-hour':         'MECHANICAL',
  'machine-room-layout':          'MECHANICAL',
  'refrigeration-cycle':          'MECHANICAL',
  'cross-ventilation-analysis':   'MECHANICAL',

  // ── 08 VERTICAL (Stairs + Elevators + Escalators) ────────────────────────
  'stairway-configurator':        'VERTICAL',
  'handrail-requirements':        'VERTICAL',
  'escalator-section':            'VERTICAL',
  'elevator-hoistway':            'VERTICAL',

  // ── 09 CONSTRUCTION (Methods & Sequences) ────────────────────────────────
  'construction-sequence-foundation': 'CONSTRUCTION',
  'foundation-types':             'CONSTRUCTION',
  'roof-truss-fink':              'CONSTRUCTION',
  'roof-truss-pratt':             'CONSTRUCTION',
  'roof-truss-howe':              'CONSTRUCTION',
  'roof-truss-warren':            'CONSTRUCTION',
  'roof-truss-king-post':         'CONSTRUCTION',
  'roof-truss-queen-post':        'CONSTRUCTION',
  'column-construction-sequence': 'CONSTRUCTION',
  'beam-construction-sequence':   'CONSTRUCTION',
  'slab-construction-sequence':   'CONSTRUCTION',
  'chb-wall-construction':        'CONSTRUCTION',
  'formwork-assembly':            'CONSTRUCTION',
  'lintel-over-opening':          'CONSTRUCTION',

  // ── 10 MATERIALS ─────────────────────────────────────────────────────────
  'concrete-mix-proportions':     'MATERIALS',
  'concrete-aggregate-visualizer':'MATERIALS',
  'wall-section-assembly':        'MATERIALS',
  'chb-block-types':              'MATERIALS',
  'bond-pattern-comparison':      'MATERIALS',
  'standard-material-sheets':     'MATERIALS',
  'rebar-catalog':                'MATERIALS',
  'steel-sections-catalog':       'MATERIALS',
  'lumber-sizes':                 'MATERIALS',
  'waterproofing-systems':        'MATERIALS',
  'mortar-joint-types':           'MATERIALS',
  'plastering-layers':            'MATERIALS',
  'wall-types-comparison':        'MATERIALS',

  // ── 11 ARCH_HISTORY (World Architecture) ─────────────────────────────────
  'classical-orders-comparison':  'ARCH_HISTORY',
  'tuscan-order':                 'ARCH_HISTORY',
  'doric-order':                  'ARCH_HISTORY',
  'ionic-order':                  'ARCH_HISTORY',
  'corinthian-order':             'ARCH_HISTORY',
  'composite-order':              'ARCH_HISTORY',
  'colossal-order':               'ARCH_HISTORY',
  'egyptian-post-lintel':         'ARCH_HISTORY',
  'greek-peristyle-temple':       'ARCH_HISTORY',
  'roman-arch-vault':             'ARCH_HISTORY',
  'byzantine-pendentive':         'ARCH_HISTORY',
  'romanesque-barrel-vault':      'ARCH_HISTORY',
  'gothic-structural-system':     'ARCH_HISTORY',
  'gothic-ribbed-vault':          'ARCH_HISTORY',
  'renaissance-dome-construction':'ARCH_HISTORY',
  'modernism-five-points':        'ARCH_HISTORY',
  'contemporary-parametric':      'ARCH_HISTORY',
  'pantheon-cutaway':             'ARCH_HISTORY',
  'hagia-sophia-section':         'ARCH_HISTORY',
  'notre-dame-section':           'ARCH_HISTORY',
  'florence-cathedral-dome':      'ARCH_HISTORY',
  'guggenheim-bilbao':            'ARCH_HISTORY',

  // ── 12 PH_HERITAGE (Philippine) ──────────────────────────────────────────
  'bahay-kubo':                   'PH_HERITAGE',
  'bahay-na-bato':                'PH_HERITAGE',
  'earthquake-baroque-church':    'PH_HERITAGE',
  'vigan-heritage-house':         'PH_HERITAGE',
  'art-deco-manila':              'PH_HERITAGE',
  'locsin-cultural-center':       'PH_HERITAGE',
  'manila-cathedral-section':     'PH_HERITAGE',
  'ifugao-house':                 'PH_HERITAGE',
  'ivatan-stone-house':           'PH_HERITAGE',
  'san-agustin-church':           'PH_HERITAGE',

  // ── 13 PLANNING (Urban Planning, Zoning & Housing) ───────────────────────
  'zoning-setback-overlay':       'PLANNING',
  'site-circulation-analysis':    'PLANNING',
  'clup-zoning-overlay':          'PLANNING',
  'subdivision-layout-pd957':     'PLANNING',
  'subdivision-layout-bp220':     'PLANNING',
  'pd957-vs-bp220-comparison':    'PLANNING',
  'water-code-easements':         'PLANNING',
  'shoreline-setback':            'PLANNING',
  'fault-line-setback':           'PLANNING',
  'housing-open-space':           'PLANNING',
  'building-typology-residential':'PLANNING',
  'building-typology-commercial': 'PLANNING',
  'building-typology-institutional': 'PLANNING',

  // ── 14 PROF_PRACTICE ─────────────────────────────────────────────────────
  'project-delivery-methods':     'PROF_PRACTICE',
  'contract-document-hierarchy':  'PROF_PRACTICE',
  'csi-masterformat-explorer':    'PROF_PRACTICE',
  'door-schedule-configurator':   'PROF_PRACTICE',

  // ── 15 ESTIMATING ────────────────────────────────────────────────────────
  'quantity-takeoff-room':        'ESTIMATING',
  'earthwork-volume':             'ESTIMATING',

  // ── 16 SITE_DEV (Parking & Site) ─────────────────────────────────────────
  'parking-layout':               'SITE_DEV',
  'parking-slot-dimensions':      'SITE_DEV',
  'carport-abutment-rules':       'SITE_DEV',
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function log(msg: string) { console.log(msg) }

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    if (!DRY_RUN) fs.mkdirSync(dir, { recursive: true })
    log(`  [mkdir] ${path.relative(ROOT, dir)}`)
  }
}

/** Get the first `export const <name>` from a module file */
function getExportName(filePath: string): string | null {
  const content = fs.readFileSync(filePath, 'utf8')
  const match = content.match(/export\s+const\s+(\w+)/)
  return match ? match[1] : null
}

/** Detect template type from config type annotation */
function getTemplateType(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf8')
  if (content.includes('ParametricSceneConfig')) return 'parametric'
  if (content.includes('ExplodedAssemblyConfig')) return 'exploded'
  if (content.includes('FloorPlanConfig')) return 'floorplan'
  if (content.includes('CutawaySectionConfig')) return 'cutaway'
  if (content.includes('AnimatedSequenceConfig')) return 'animated'
  return 'parametric'
}

/** Fix import paths: any depth of ../../ to _types → correct relative path */
function fixImportPaths(filePath: string, _catFolder: string) {
  const content = fs.readFileSync(filePath, 'utf8')
  // Module files are at _config/modules/{catFolder}/{file}.ts
  // They need to reach _types/ which is at ../../_types/ from _config/modules/
  // But since they're one more level deep: ../../../_types/
  const updated = content
    .replace(/from ['"]\.\.\/\.\.\/(_types\/[^'"]+)['"]/g, "from '../../../$1'")
    .replace(/from ['"]\.\.\/\.\.\/\.\.\/(_types\/[^'"]+)['"]/g, "from '../../../$1'")
  if (updated !== content) {
    if (!DRY_RUN) fs.writeFileSync(filePath, updated, 'utf8')
    return true
  }
  return false
}

/** Find a module file across all existing category folders or flat modules dir */
function findModuleFile(moduleId: string): string | null {
  // Check flat modules dir first
  const flat = path.join(MODULES_DIR, `${moduleId}.ts`)
  if (fs.existsSync(flat)) return flat

  // Check all subdirectories
  const dirs = fs.readdirSync(MODULES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
  for (const dir of dirs) {
    const candidate = path.join(MODULES_DIR, dir.name, `${moduleId}.ts`)
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  if (DRY_RUN) log('─── DRY RUN MODE ───────────────────────────────────────────')

  // Step 1: Create category folders
  log('\n── Step 1: Creating category folders ──────────────────────────────────────')
  ensureDir(REGISTRY_DIR)
  for (const cat of CATEGORIES) {
    ensureDir(path.join(MODULES_DIR, cat.folder))
  }

  // Step 2: Move module files to correct category folders
  log('\n── Step 2: Moving module files ─────────────────────────────────────────────')
  const moved: Record<string, string[]> = {}
  for (const cat of CATEGORIES) moved[cat.key] = []

  const unmapped: string[] = []

  for (const [moduleId, catKey] of Object.entries(MODULE_MAP)) {
    const cat = CAT_BY_KEY[catKey]
    if (!cat) {
      console.error(`  ERROR: Unknown category key '${catKey}' for module '${moduleId}'`)
      continue
    }

    const srcPath = findModuleFile(moduleId)
    if (!srcPath) {
      unmapped.push(moduleId)
      continue
    }

    const destPath = path.join(MODULES_DIR, cat.folder, `${moduleId}.ts`)

    if (srcPath === destPath) {
      // Already in correct location
      moved[catKey].push(moduleId)
      fixImportPaths(destPath, cat.folder)
      continue
    }

    if (fs.existsSync(destPath)) {
      log(`  [skip]  ${moduleId}.ts already in ${cat.folder}/`)
      moved[catKey].push(moduleId)
      fixImportPaths(destPath, cat.folder)
      continue
    }

    log(`  [move]  ${moduleId}.ts → ${cat.folder}/`)
    if (!DRY_RUN) {
      fs.renameSync(srcPath, destPath)
      fixImportPaths(destPath, cat.folder)
    }
    moved[catKey].push(moduleId)
  }

  if (unmapped.length > 0) {
    console.warn(`\n  WARNING: ${unmapped.length} module(s) not found on disk:`)
    unmapped.forEach(id => console.warn(`    - ${id}`))
  }

  // Step 3: Generate registry files
  log('\n── Step 3: Generating registry files ──────────────────────────────────────')

  for (const cat of CATEGORIES) {
    const modules = moved[cat.key] ?? []
    const registryPath = path.join(REGISTRY_DIR, `cat-${cat.id}.ts`)

    if (modules.length === 0) {
      const content = `// cat-${cat.id}: ${cat.label}
// Auto-generated by scripts/regen-taxonomy-v2.ts

import type { ModuleRegistryEntry } from '../../_types/templates'

export const cat${cat.id}Modules: ModuleRegistryEntry[] = []
`
      if (!DRY_RUN) fs.writeFileSync(registryPath, content)
      log(`  [write] cat-${cat.id}.ts (empty — ${cat.label})`)
      continue
    }

    // Read actual export names
    const entries: Array<{ moduleId: string; exportName: string; templateType: string }> = []
    for (const moduleId of modules.sort()) {
      const filePath = path.join(MODULES_DIR, cat.folder, `${moduleId}.ts`)
      if (!fs.existsSync(filePath)) continue
      const exportName = getExportName(filePath)
      if (!exportName) {
        console.warn(`  WARNING: No export in ${cat.folder}/${moduleId}.ts`)
        continue
      }
      entries.push({
        moduleId,
        exportName,
        templateType: getTemplateType(filePath),
      })
    }

    const importLines = entries
      .map(e => `import { ${e.exportName} } from '../modules/${cat.folder}/${e.moduleId}'`)
      .join('\n')

    const entryLines = entries
      .map(e => `  {
    id: ${e.exportName}.id,
    title: ${e.exportName}.title,
    templateType: '${e.templateType}' as const,
    subject: ${e.exportName}.subject,
    categoryId: '${cat.key}',
    launchPhase: ${cat.phase},
    status: 'ready' as const,
    description: ${e.exportName}.description,
  },`)
      .join('\n')

    const content = `// cat-${cat.id}: ${cat.label}
// Auto-generated by scripts/regen-taxonomy-v2.ts

import type { ModuleRegistryEntry } from '../../_types/templates'
${importLines}

export const cat${cat.id}Modules: ModuleRegistryEntry[] = [
${entryLines}
]
`
    if (!DRY_RUN) fs.writeFileSync(registryPath, content)
    log(`  [write] cat-${cat.id}.ts (${entries.length} modules — ${cat.label})`)
  }

  // Step 4: Generate master index
  log('\n── Step 4: Generating registry index ──────────────────────────────────────')
  const importAll = CATEGORIES
    .map(c => `import { cat${c.id}Modules } from './cat-${c.id}'`)
    .join('\n')
  const spreadAll = CATEGORIES
    .map(c => `  ...cat${c.id}Modules,`)
    .join('\n')
  const exportAll = CATEGORIES
    .map(c => `  cat${c.id}Modules,`)
    .join('\n')

  const indexContent = `// Master Module Registry (LEA-aligned taxonomy)
// Auto-generated by scripts/regen-taxonomy-v2.ts

import type { ModuleRegistryEntry } from '../../_types/templates'
import type { TemplateType } from '../../_types/templates'
import type { CategoryKey } from '../taxonomy'
${importAll}

export const ALL_MODULES: ModuleRegistryEntry[] = [
${spreadAll}
]

export {
${exportAll}
}

// ─── Helper Functions ────────────────────────────────────────────────────────

export function getModuleById(id: string): ModuleRegistryEntry | undefined {
  return ALL_MODULES.find((m) => m.id === id)
}

export function getModulesByCategory(categoryKey: CategoryKey): ModuleRegistryEntry[] {
  return ALL_MODULES.filter((m) => m.categoryId === categoryKey)
}

export function getModulesByTemplate(templateType: TemplateType): ModuleRegistryEntry[] {
  return ALL_MODULES.filter((m) => m.templateType === templateType)
}

export function getModulesByPhase(phase: 1 | 2 | 3): ModuleRegistryEntry[] {
  return ALL_MODULES.filter((m) => m.launchPhase === phase)
}
`
  if (!DRY_RUN) fs.writeFileSync(path.join(REGISTRY_DIR, 'index.ts'), indexContent)
  log(`  [write] index.ts`)

  // Step 5: Clean up empty old category folders
  log('\n── Step 5: Cleaning empty old folders ─────────────────────────────────────')
  const allDirs = fs.readdirSync(MODULES_DIR, { withFileTypes: true }).filter(d => d.isDirectory())
  const validFolders = new Set(CATEGORIES.map(c => c.folder))
  for (const dir of allDirs) {
    if (validFolders.has(dir.name)) continue
    const dirPath = path.join(MODULES_DIR, dir.name)
    const remaining = fs.readdirSync(dirPath)
    if (remaining.length === 0) {
      if (!DRY_RUN) fs.rmdirSync(dirPath)
      log(`  [rmdir] ${dir.name}/ (empty)`)
    } else {
      log(`  [kept]  ${dir.name}/ (${remaining.length} files remaining)`)
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  log('\n── Summary ──────────────────────────────────────────────────────────────────')
  log(`${'Category'.padEnd(16)} ${'ID'.padEnd(4)} ${'Phase'.padEnd(7)} Count`)
  log('─'.repeat(50))

  let total = 0
  for (const cat of CATEGORIES) {
    const count = (moved[cat.key] ?? []).length
    total += count
    const status = count === 0 ? '  (empty)' : ''
    log(`${cat.key.padEnd(16)} ${cat.id.padEnd(4)} ${String(cat.phase).padEnd(7)} ${count}${status}`)
  }
  log('─'.repeat(50))
  log(`${'TOTAL'.padEnd(16)} ${' '.padEnd(4)} ${' '.padEnd(7)} ${total}`)
  log(`\n${DRY_RUN ? 'Dry run complete. Re-run without --dry-run to apply.' : 'Migration complete.'}`)
}

main()
