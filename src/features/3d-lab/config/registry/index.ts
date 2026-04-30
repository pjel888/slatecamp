// Master Module Registry (LEA-aligned taxonomy)
// Metadata-only registry for the 3D Lab browser.

import type { ModuleRegistryEntry, TemplateType } from '@/features/3d-lab/types/templates'
import type { CategoryKey } from '../taxonomy'
import { cat01Modules } from './cat-01'
import { cat02Modules } from './cat-02'
import { cat03Modules } from './cat-03'
import { cat04Modules } from './cat-04'
import { cat05Modules } from './cat-05'
import { cat06Modules } from './cat-06'
import { cat07Modules } from './cat-07'
import { cat08Modules } from './cat-08'
import { cat09Modules } from './cat-09'
import { cat10Modules } from './cat-10'
import { cat11Modules } from './cat-11'
import { cat12Modules } from './cat-12'
import { cat13Modules } from './cat-13'
import { cat14Modules } from './cat-14'
import { cat15Modules } from './cat-15'
import { cat16Modules } from './cat-16'

export const ALL_MODULES: ModuleRegistryEntry[] = [
  ...cat01Modules,
  ...cat02Modules,
  ...cat03Modules,
  ...cat04Modules,
  ...cat05Modules,
  ...cat06Modules,
  ...cat07Modules,
  ...cat08Modules,
  ...cat09Modules,
  ...cat10Modules,
  ...cat11Modules,
  ...cat12Modules,
  ...cat13Modules,
  ...cat14Modules,
  ...cat15Modules,
  ...cat16Modules,
]

export {
  cat01Modules,
  cat02Modules,
  cat03Modules,
  cat04Modules,
  cat05Modules,
  cat06Modules,
  cat07Modules,
  cat08Modules,
  cat09Modules,
  cat10Modules,
  cat11Modules,
  cat12Modules,
  cat13Modules,
  cat14Modules,
  cat15Modules,
  cat16Modules,
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
