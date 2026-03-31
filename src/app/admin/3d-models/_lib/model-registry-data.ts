// src/app/admin/3d-models/_lib/model-registry-data.ts
// ─── Admin: 3D Model Registry Data Aggregation ────────────────────────────────
// Transforms the 3D Lab module registry into a hierarchical tree for the admin
// dashboard. Pure data aggregation — no React, no side effects.

import { ALL_MODULES } from '@/app/dashboard/3d-lab/_config/registry/index'
import { ASSET_TAXONOMY, ALE_SUBJECTS } from '@/app/dashboard/3d-lab/_config/taxonomy'
import type { CategoryKey } from '@/app/dashboard/3d-lab/_config/taxonomy'
import type { ModuleConfig } from '@/app/dashboard/3d-lab/_types/templates'

// ─── Hierarchical Tree Types ─────────────────────────────────────────────────

export interface ModelNode {
  id: string
  title: string
  templateType: string
  subject: string
  categoryId: string
  launchPhase: number
  status: string
  description: string
}

export interface CategoryNode {
  key: string
  id: string
  label: string
  description: string
  icon: string
  phase: number
  aleSubject: string
  modules: ModelNode[]
  moduleCount: number
}

export interface AleSubjectNode {
  label: string
  categories: CategoryNode[]
  totalModules: number
}

export interface RegistryTree {
  subjects: AleSubjectNode[]
  totalModules: number
  totalCategories: number
}

// ─── Category Key → Folder Name Mapping ─────────────────────────────────────

const CATEGORY_FOLDER_MAP: Record<CategoryKey, string> = {
  BUILDING_CODE:  '01-building-code',
  ACCESSIBILITY:  '02-accessibility',
  FIRE_CODE:      '03-fire-code',
  STRUCTURAL:     '04-structural',
  PLUMBING:       '05-plumbing',
  ELECTRICAL:     '06-electrical',
  MECHANICAL:     '07-mechanical',
  VERTICAL:       '08-vertical',
  CONSTRUCTION:   '09-construction',
  MATERIALS:      '10-materials',
  ARCH_HISTORY:   '11-arch-history',
  PH_HERITAGE:    '12-ph-heritage',
  PLANNING:       '13-planning',
  PROF_PRACTICE:  '14-prof-practice',
  ESTIMATING:     '15-estimating',
  SITE_DEV:       '16-site-dev',
}

// ─── buildRegistryTree ───────────────────────────────────────────────────────

/**
 * Builds a fully hierarchical RegistryTree from the flat ALL_MODULES array,
 * grouped first by ALE subject then by category.
 */
export function buildRegistryTree(): RegistryTree {
  // Group modules by categoryId
  const modulesByCategory = new Map<string, ModelNode[]>()

  for (const module of ALL_MODULES) {
    const catKey = module.categoryId ?? 'UNKNOWN'
    if (!modulesByCategory.has(catKey)) {
      modulesByCategory.set(catKey, [])
    }
    modulesByCategory.get(catKey)!.push({
      id: module.id,
      title: module.title,
      templateType: module.templateType,
      subject: module.subject,
      categoryId: catKey,
      launchPhase: module.launchPhase ?? 1,
      status: module.status,
      description: module.description ?? '',
    })
  }

  // Build AleSubjectNode array following ALE_SUBJECTS order
  const subjects: AleSubjectNode[] = ALE_SUBJECTS.map((aleSubject) => {
    const categories: CategoryNode[] = aleSubject.categories.map((catKey) => {
      const taxonomy = ASSET_TAXONOMY[catKey as CategoryKey]
      const modules = modulesByCategory.get(catKey) ?? []

      return {
        key: catKey,
        id: taxonomy.id,
        label: taxonomy.label,
        description: taxonomy.description,
        icon: taxonomy.icon,
        phase: taxonomy.phase,
        aleSubject: taxonomy.aleSubject,
        modules,
        moduleCount: modules.length,
      }
    })

    const totalModules = categories.reduce((sum, cat) => sum + cat.moduleCount, 0)

    return {
      label: aleSubject.label,
      categories,
      totalModules,
    }
  })

  const totalModules = subjects.reduce((sum, s) => sum + s.totalModules, 0)
  const totalCategories = subjects.reduce((sum, s) => sum + s.categories.length, 0)

  return { subjects, totalModules, totalCategories }
}

// ─── getModelConfigDetail ────────────────────────────────────────────────────

/**
 * Dynamically imports the full config object for a given module ID.
 * Finds the categoryId from the registry, maps it to the folder name, then
 * imports the module file and returns the first exported const value (which
 * is always the config object for these files).
 *
 * Returns null if the module is not found or the import fails.
 */
export async function getModelConfigDetail(moduleId: string): Promise<ModuleConfig | null> {
  try {
    // Look up the registry entry to get categoryId
    const entry = ALL_MODULES.find((m) => m.id === moduleId)
    if (!entry || !entry.categoryId) return null

    const folder = CATEGORY_FOLDER_MAP[entry.categoryId]
    if (!folder) return null

    // Dynamic import of the module config file
    const mod = await import(
      `@/app/dashboard/3d-lab/_config/modules/${folder}/${moduleId}`
    ) as Record<string, unknown>

    // The export name varies per file (e.g. occupancyClassificationConfig).
    // Take the first exported value that is a non-null object.
    const config = Object.values(mod).find(
      (v) => v !== null && typeof v === 'object'
    )

    if (!config) return null

    return config as ModuleConfig
  } catch {
    return null
  }
}
