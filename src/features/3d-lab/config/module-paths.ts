import { ALL_MODULES } from '@/features/3d-lab/config/registry'
import type { CategoryKey } from '@/features/3d-lab/config/taxonomy'

export const CATEGORY_FOLDER_MAP: Record<CategoryKey, string> = {
  BUILDING_CODE: '01-building-code',
  ACCESSIBILITY: '02-accessibility',
  FIRE_CODE: '03-fire-code',
  STRUCTURAL: '04-structural',
  PLUMBING: '05-plumbing',
  ELECTRICAL: '06-electrical',
  MECHANICAL: '07-mechanical',
  VERTICAL: '08-vertical',
  CONSTRUCTION: '09-construction',
  MATERIALS: '10-materials',
  ARCH_HISTORY: '11-arch-history',
  PH_HERITAGE: '12-ph-heritage',
  PLANNING: '13-planning',
  PROF_PRACTICE: '14-prof-practice',
  ESTIMATING: '15-estimating',
  SITE_DEV: '16-site-dev',
}

export const MODULE_IMPORT_PATHS: Record<string, string> = Object.fromEntries(
  ALL_MODULES.flatMap((module) => {
    if (!module.categoryId) {
      return []
    }

    const folder = CATEGORY_FOLDER_MAP[module.categoryId]

    if (!folder) {
      return []
    }

    return [[module.id, `${folder}/${module.id}`]]
  }),
)

export const getModuleImportPath = (moduleId: string) =>
  MODULE_IMPORT_PATHS[moduleId] ?? moduleId

export const importModuleConfig = async (moduleId: string) => {
  const path = getModuleImportPath(moduleId)

  const mod = (await import(
    /* webpackExclude: /\.(test|spec)\.(ts|tsx)$/ */
    `@/features/3d-lab/config/modules/${path}` as string
  )) as Record<string, unknown>

  return Object.values(mod)[0] ?? null
}
