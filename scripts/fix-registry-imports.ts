#!/usr/bin/env bun
/**
 * scripts/fix-registry-imports.ts
 *
 * Fixes the auto-generated registry files (cat-01.ts through cat-18.ts)
 * by reading each module file's actual export name instead of guessing.
 *
 * Usage: bun scripts/fix-registry-imports.ts
 */

import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dir, '..')
const MODULES_DIR = path.join(ROOT, 'src/app/dashboard/3d-lab/_config/modules')
const REGISTRY_DIR = path.join(ROOT, 'src/app/dashboard/3d-lab/_config/registry')

const CATEGORIES: Record<string, { id: string; folder: string; label: string; phase: 1 | 2 | 3; categoryKey: string }> = {
  '01': { id: '01', folder: '01-structural',   label: 'Structural & Framing',              phase: 1, categoryKey: 'STRUCTURAL' },
  '02': { id: '02', folder: '02-envelope',     label: 'Building Envelope',                 phase: 2, categoryKey: 'ENVELOPE' },
  '03': { id: '03', folder: '03-glazing',      label: 'Glazing & Fenestration',            phase: 2, categoryKey: 'GLAZING' },
  '04': { id: '04', folder: '04-hardware',     label: 'Architectural Hardware',            phase: 3, categoryKey: 'HARDWARE' },
  '05': { id: '05', folder: '05-hvac',         label: 'Mechanical & HVAC',                 phase: 2, categoryKey: 'HVAC' },
  '06': { id: '06', folder: '06-plumbing',     label: 'Plumbing & Sanitary',               phase: 1, categoryKey: 'PLUMBING' },
  '07': { id: '07', folder: '07-fire',         label: 'Fire Protection',                   phase: 2, categoryKey: 'FIRE' },
  '08': { id: '08', folder: '08-electrical',   label: 'Electrical Power',                  phase: 2, categoryKey: 'ELECTRICAL' },
  '09': { id: '09', folder: '09-auxiliary',     label: 'Auxiliary Systems',                 phase: 2, categoryKey: 'AUXILIARY' },
  '10': { id: '10', folder: '10-finishes',     label: 'Architectural Finishes',            phase: 1, categoryKey: 'FINISHES' },
  '11': { id: '11', folder: '11-civil',        label: 'Civil & Site Development',          phase: 3, categoryKey: 'CIVIL' },
  '12': { id: '12', folder: '12-woodcraft',    label: 'Woodcraft & Joinery',               phase: 3, categoryKey: 'WOODCRAFT' },
  '13': { id: '13', folder: '13-millwork',     label: 'Millwork & Cabinetry',              phase: 3, categoryKey: 'MILLWORK' },
  '14': { id: '14', folder: '14-stairs',       label: 'Stairs & Vertical Circulation',     phase: 1, categoryKey: 'STAIRS' },
  '15': { id: '15', folder: '15-heritage',     label: 'Philippine Vernacular & Heritage',  phase: 1, categoryKey: 'HERITAGE' },
  '16': { id: '16', folder: '16-masonry',      label: 'Masonry & Stonework',               phase: 3, categoryKey: 'MASONRY' },
  '17': { id: '17', folder: '17-concrete',     label: 'Specialized Concrete',              phase: 3, categoryKey: 'CONCRETE' },
  '18': { id: '18', folder: '18-topography',   label: 'Topography & Landscape',            phase: 3, categoryKey: 'TOPOGRAPHY' },
}

/** Extract the first `export const <name>` from a module file */
function getExportName(filePath: string): string | null {
  const content = fs.readFileSync(filePath, 'utf8')
  const match = content.match(/export\s+const\s+(\w+)/)
  return match ? match[1] : null
}

function main() {
  let totalModules = 0

  for (const [catId, cat] of Object.entries(CATEGORIES)) {
    const catFolder = path.join(MODULES_DIR, cat.folder)
    if (!fs.existsSync(catFolder)) {
      // Write empty registry
      const content = `// Auto-generated — do not edit manually.
import type { ModuleRegistryEntry } from '../../_types/templates'

const modules: ModuleRegistryEntry[] = []
export default modules
export { modules as cat${catId}Modules }
`
      fs.writeFileSync(path.join(REGISTRY_DIR, `cat-${catId}.ts`), content)
      console.log(`cat-${catId} (${cat.label}): 0 modules`)
      continue
    }

    const files = fs.readdirSync(catFolder)
      .filter(f => f.endsWith('.ts'))
      .sort()

    const entries: Array<{ fileName: string; exportName: string }> = []

    for (const file of files) {
      const filePath = path.join(catFolder, file)
      const exportName = getExportName(filePath)
      if (exportName) {
        entries.push({ fileName: file.replace(/\.ts$/, ''), exportName })
      } else {
        console.warn(`  WARNING: No export found in ${cat.folder}/${file}`)
      }
    }

    const importLines = entries
      .map(e => `import { ${e.exportName} } from '../modules/${cat.folder}/${e.fileName}'`)
      .join('\n')

    const entryLines = entries
      .map(e => {
        // The module configs are typed objects, not ModuleRegistryEntry.
        // We spread the id, title, subject, templateType, status, description from them.
        return `  {
    id: ${e.exportName}.id,
    title: ${e.exportName}.title,
    templateType: '${getTemplateType(path.join(catFolder, e.fileName + '.ts'))}' as const,
    subject: ${e.exportName}.subject,
    categoryId: '${cat.categoryKey}',
    launchPhase: ${cat.phase},
    status: 'ready' as const,
    description: ${e.exportName}.description,
  },`
      })
      .join('\n')

    const content = `// src/app/dashboard/3d-lab/_config/registry/cat-${catId}.ts
// ─── Category ${catId}: ${cat.label} ─────────────────────────────────────────
// Auto-generated by scripts/fix-registry-imports.ts — do not edit manually.

import type { ModuleRegistryEntry } from '../../_types/templates'
${entries.length > 0 ? '\n' + importLines + '\n' : ''}
export const cat${catId}Modules: ModuleRegistryEntry[] = [
${entryLines}
]
`
    fs.writeFileSync(path.join(REGISTRY_DIR, `cat-${catId}.ts`), content)
    totalModules += entries.length
    console.log(`cat-${catId} (${cat.label}): ${entries.length} modules`)
  }

  console.log(`\nTotal: ${totalModules} modules across ${Object.keys(CATEGORIES).length} categories`)
}

/** Detect template type from the config's type annotation */
function getTemplateType(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf8')
  if (content.includes('ParametricSceneConfig')) return 'parametric'
  if (content.includes('ExplodedAssemblyConfig')) return 'exploded'
  if (content.includes('FloorPlanConfig')) return 'floorplan'
  if (content.includes('CutawaySectionConfig')) return 'cutaway'
  if (content.includes('AnimatedSequenceConfig')) return 'animated'
  return 'parametric' // fallback
}

main()
