#!/usr/bin/env bun
// scripts/audit-legal-citations.ts
// Scans all 3D Lab module configs for hardcoded numeric values
// that should reference shared constants instead.

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

const MODULES_DIR = join(import.meta.dir, '..', 'src', 'features', '3d-lab', 'config', 'modules')

const KNOWN_VALUES: Record<string, string> = {
  '6.0': 'PD_1096.ROOM_MIN_AREA.habitable',
  '3.0': 'PD_1096.ROOM_MIN_AREA.kitchen',
  '1.2': 'PD_1096.ROOM_MIN_AREA.bathroom',
  '2.7': 'PD_1096.CEILING_HEIGHT.habitable',
  '0.20': 'PD_1096.STAIRCASE.maxRiser / BP_344.STAIRCASE.maxRiser',
  '0.90': 'BP_344.MIN_CORRIDOR_WIDTH / PD_1096.STAIRCASE.minDoorWidth',
  '1.80': 'BP_344.WHEELCHAIR.turningCircle',
  '0.80': 'BP_344.WHEELCHAIR.minWidth / BP_344.MIN_DOOR_WIDTH',
  '46': 'RA_9514.TRAVEL_DISTANCE (assembly/business)',
  '23': 'RA_9514.EXTINGUISHER_MAX_TRAVEL_M',
  '15': 'RA_9514.HIGH_RISE_THRESHOLD_M',
}

const scanFile = async (filePath: string): Promise<{ file: string; hits: { line: number; value: string; suggestion: string }[] }> => {
  const content = await readFile(filePath, 'utf-8')
  const lines = content.split('\n')
  const hits: { line: number; value: string; suggestion: string }[] = []

  lines.forEach((line, idx) => {
    // Skip imports and comments
    if (line.trim().startsWith('import') || line.trim().startsWith('//') || line.trim().startsWith('*')) return

    for (const [val, suggestion] of Object.entries(KNOWN_VALUES)) {
      // Match numeric literals (not inside strings)
      const regex = new RegExp(`(?<![\\w.])${val.replace('.', '\\.')}(?![\\w])`, 'g')
      if (regex.test(line)) {
        hits.push({ line: idx + 1, value: val, suggestion })
      }
    }
  })

  return { file: filePath, hits }
}

const scanDir = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...await scanDir(full))
    else if (entry.name.endsWith('.ts')) files.push(full)
  }
  return files
}

const main = async () => {
  console.log('Scanning 3D Lab module configs for hardcoded values...\n')
  const files = await scanDir(MODULES_DIR)
  let totalHits = 0
  let filesWithHits = 0

  for (const file of files) {
    const result = await scanFile(file)
    if (result.hits.length > 0) {
      filesWithHits++
      const rel = file.replace(MODULES_DIR, '')
      console.log(`FILE: ${rel}`)
      for (const hit of result.hits) {
        console.log(`   L${hit.line}: ${hit.value} -> use ${hit.suggestion}`)
        totalHits++
      }
      console.log()
    }
  }

  console.log(`\nSummary: ${totalHits} hardcoded values in ${filesWithHits}/${files.length} files`)
  console.log('   These values should reference shared constants from config/constants/')
}

main().catch(console.error)
