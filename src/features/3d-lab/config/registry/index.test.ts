import { describe, expect, test } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'
import { DASHBOARD_VISIBLE_IDS } from '../dashboard-visibility'
import { ALL_MODULES, getModuleById } from './index'

const registryDir = path.join(process.cwd(), 'src/features/3d-lab/config/registry')
const metadataOnlyAllowedKeys = new Set([
  'id',
  'title',
  'templateType',
  'subject',
  'categoryId',
  'launchPhase',
  'codeRef',
  'priority',
  'status',
  'description',
  'thumbnail',
  'contextScenario',
  'leaQuestionCount',
  'supportedPhases',
  'assets',
])

describe('3D Lab metadata registry', () => {
  test('has unique module IDs', () => {
    const ids = ALL_MODULES.map((module) => module.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('resolves every dashboard-visible module', () => {
    for (const moduleId of DASHBOARD_VISIBLE_IDS) {
      expect(getModuleById(moduleId)?.id).toBe(moduleId)
    }
  })

  test('contains metadata-only entries', () => {
    for (const module of ALL_MODULES) {
      for (const key of Object.keys(module)) {
        expect(metadataOnlyAllowedKeys.has(key)).toBe(true)
      }

      for (const value of Object.values(module)) {
        expect(typeof value).not.toBe('function')
      }
    }
  })

  test('category registry files do not import full module configs', () => {
    const categoryFiles = fs
      .readdirSync(registryDir)
      .filter((file) => /^cat-\d+\.ts$/.test(file))

    expect(categoryFiles.length).toBeGreaterThan(0)

    for (const file of categoryFiles) {
      const source = fs.readFileSync(path.join(registryDir, file), 'utf8')
      expect(source).not.toContain('config/modules')
      expect(source).not.toMatch(/^import\s+\{(?!\s*type\b)/m)
    }
  })
})
