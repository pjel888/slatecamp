// src/app/admin/3d-models/_lib/model-registry-data.ts
// ─── Admin: 3D Model Registry Data Aggregation ────────────────────────────────
// Transforms the 3D Lab module registry into a hierarchical tree for the admin
// dashboard. Pure data aggregation — no React, no side effects.

import { ALL_MODULES } from '@/features/3d-lab/config/registry'
import { ASSET_TAXONOMY, LEA_SUBJECTS } from '@/features/3d-lab/config/taxonomy'
import type { CategoryKey } from '@/features/3d-lab/config/taxonomy'
import { importModuleConfig } from '@/features/3d-lab/config/module-paths'
import type { ModuleConfig } from '@/features/3d-lab/types/templates'

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
  leaSubject: string
  modules: ModelNode[]
  moduleCount: number
}

export interface LeaSubjectNode {
  label: string
  categories: CategoryNode[]
  totalModules: number
}

export interface RegistryTree {
  subjects: LeaSubjectNode[]
  totalModules: number
  totalCategories: number
}

// ─── buildRegistryTree ───────────────────────────────────────────────────────

/**
 * Builds a fully hierarchical RegistryTree from the flat ALL_MODULES array,
 * grouped first by LEA subject then by category.
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

  // Build LeaSubjectNode array following LEA_SUBJECTS order
  const subjects: LeaSubjectNode[] = LEA_SUBJECTS.map((leaSubject) => {
    const categories: CategoryNode[] = leaSubject.categories.map((catKey) => {
      const taxonomy = ASSET_TAXONOMY[catKey as CategoryKey]
      const modules = modulesByCategory.get(catKey) ?? []

      return {
        key: catKey,
        id: taxonomy.id,
        label: taxonomy.label,
        description: taxonomy.description,
        icon: taxonomy.icon,
        phase: taxonomy.phase,
        leaSubject: taxonomy.leaSubject,
        modules,
        moduleCount: modules.length,
      }
    })

    const totalModules = categories.reduce((sum, cat) => sum + cat.moduleCount, 0)

    return {
      label: leaSubject.label,
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
    const config = await importModuleConfig(moduleId)
    return config as ModuleConfig | null
  } catch {
    return null
  }
}
