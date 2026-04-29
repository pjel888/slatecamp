// src/app/dashboard/3d-lab/_utils/registryLoader.ts
// ─── Segmented Registry Loader ──────────────────────────────────────────────
// Dynamically imports only the registry for the active category,
// keeping the main bundle free of 200+ module metadata entries.

import type { ModuleRegistryEntry } from '../types/templates'
import type { CategoryKey } from '../config/taxonomy'
import { ASSET_TAXONOMY } from '../config/taxonomy'

/** Registry cache to avoid re-importing the same category */
const registryCache = new Map<string, ModuleRegistryEntry[]>()

/**
 * Dynamically load the registry for a single category.
 * Uses the 2-digit category ID to resolve the correct file.
 *
 * @example
 * const modules = await getRegistryByCategory('STRUCTURAL')
 */
export async function getRegistryByCategory(
  categoryKey: CategoryKey
): Promise<ModuleRegistryEntry[]> {
  const cat = ASSET_TAXONOMY[categoryKey]
  const cacheKey = cat.id

  if (registryCache.has(cacheKey)) {
    return registryCache.get(cacheKey)!
  }

  try {
    const registry = await import(`../../../../features/3d-lab/config/registry/cat-${cat.id}.ts`)
    const entries: ModuleRegistryEntry[] = registry.default ?? registry.modules ?? []
    registryCache.set(cacheKey, entries)
    return entries
  } catch {
    // Category registry file doesn't exist yet (e.g. empty category)
    return []
  }
}

/**
 * Load registries for all categories in a given launch phase.
 * Useful for the phase-filtered gallery view.
 */
export async function getRegistryByPhase(
  phase: 1 | 2 | 3
): Promise<ModuleRegistryEntry[]> {
  const categoryKeys = (Object.keys(ASSET_TAXONOMY) as CategoryKey[])
    .filter(key => ASSET_TAXONOMY[key].phase === phase)

  const results = await Promise.all(
    categoryKeys.map(key => getRegistryByCategory(key))
  )

  return results.flat()
}

/**
 * Load all registries across all categories.
 * Use sparingly — prefer category-scoped loading.
 */
export async function getAllRegistries(): Promise<ModuleRegistryEntry[]> {
  const allKeys = Object.keys(ASSET_TAXONOMY) as CategoryKey[]
  const results = await Promise.all(
    allKeys.map(key => getRegistryByCategory(key))
  )
  return results.flat()
}
