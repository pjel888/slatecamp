import { describe, expect, test } from 'bun:test'
import {
  globalOnboardingKeys,
  moduleOnboardingKeys,
  readStorageFlag,
  resolveInitial3DLabOnboardingOverlay,
  viewportTooltipKeys,
} from './state'

class MemoryStorage {
  private values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

describe('3D Lab onboarding state', () => {
  test('keeps global orientation as the first overlay', () => {
    expect(
      resolveInitial3DLabOnboardingOverlay({
        globalComplete: false,
        moduleSeen: false,
      }),
    ).toBe('global')
  })

  test('shows module context only after global orientation is complete', () => {
    expect(
      resolveInitial3DLabOnboardingOverlay({
        globalComplete: true,
        moduleSeen: false,
      }),
    ).toBe('module')
  })

  test('returns none when both global and module onboarding are already complete', () => {
    expect(
      resolveInitial3DLabOnboardingOverlay({
        globalComplete: true,
        moduleSeen: true,
      }),
    ).toBe('none')
  })

  test('recognizes current and legacy localStorage keys', () => {
    const storage = new MemoryStorage()

    storage.setItem('3dlab_onboarded', 'true')
    storage.setItem('module_stairway-code-compliance_seen', 'true')
    storage.setItem('slatecamp-viewport-onboarding-seen', 'true')

    expect(readStorageFlag(storage, globalOnboardingKeys())).toBe(true)
    expect(readStorageFlag(storage, moduleOnboardingKeys('stairway-code-compliance'))).toBe(true)
    expect(readStorageFlag(storage, viewportTooltipKeys())).toBe(true)
  })
})
