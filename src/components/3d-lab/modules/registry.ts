// New-format module registry — maps slug to lazy-loaded ModuleConfig.
// Add entries here as modules are migrated from old ParametricSceneConfig format.

import type { ModuleConfig } from '@/types/3d-lab'

type ModuleLoader = () => Promise<ModuleConfig>

// TODO: Register modules here once GLB model files are available.
// Configs exist at ./AccessibleToilet/toilet.config.ts and ./StairwayConfigurator/stairway.config.ts
export const NEW_MODULE_REGISTRY: Record<string, ModuleLoader> = {}

export const hasNewConfig = (slug: string): boolean =>
  slug in NEW_MODULE_REGISTRY

export const loadNewConfig = (slug: string): Promise<ModuleConfig> | null => {
  const loader = NEW_MODULE_REGISTRY[slug]
  return loader ? loader() : null
}
