import { describe, expect, test } from 'bun:test'
import { DASHBOARD_VISIBLE_IDS } from './dashboard-visibility'
import { getModuleImportPath, importModuleConfig } from './module-paths'
import { getModuleById } from './registry'

describe('3D Lab module import paths', () => {
  test('resolves known modules to their category folder path', () => {
    expect(getModuleImportPath('site-development-controls')).toBe(
      '01-building-code/site-development-controls',
    )
    expect(getModuleImportPath('stairway-configurator')).toBe(
      '08-vertical/stairway-configurator',
    )
    expect(getModuleImportPath('unified-wall-configurator')).toBe(
      '10-materials/unified-wall-configurator',
    )
  })

  test('falls back to the raw module id when no mapping exists', () => {
    expect(getModuleImportPath('unknown-module')).toBe('unknown-module')
  })

  test('imports a mapped module config from the shared resolver', async () => {
    const config = await importModuleConfig('stairway-configurator')

    expect(config).not.toBeNull()
    expect((config as { id?: string }).id).toBe('stairway-configurator')
  })

  test('imports full configs for dashboard-visible modules without relying on registry configs', async () => {
    for (const moduleId of DASHBOARD_VISIBLE_IDS) {
      const metadata = getModuleById(moduleId)
      const config = await importModuleConfig(moduleId) as { id?: string; title?: string; subject?: string } | null

      expect(metadata?.id).toBe(moduleId)
      expect(getModuleImportPath(moduleId)).not.toBe(moduleId)
      expect(config?.id).toBe(moduleId)
      expect(config?.title).toBe(metadata?.title)
      expect(config?.subject).toBe(metadata?.subject)
    }
  })
})
