'use client'

export type ThreeDLabOnboardingOverlay = 'none' | 'global' | 'module'

type FlagStorage = Pick<Storage, 'getItem' | 'setItem'>

type OnboardingEventName =
  | 'overlay-resolved'
  | 'global-completed'
  | 'module-seen'
  | 'viewport-tooltip-seen'

type OnboardingEvent = {
  event: OnboardingEventName
  moduleId?: string
  overlay?: ThreeDLabOnboardingOverlay
  timestamp: string
}

declare global {
  interface Window {
    __slatecamp3dLabOnboarding?: {
      activeOverlay: ThreeDLabOnboardingOverlay
      activeModuleId?: string
      events: OnboardingEvent[]
    }
  }
}

export const THREE_D_LAB_ONBOARDING_KEYS = {
  global: 'slatecamp-3dlab:onboarding:v1:global-complete',
  viewportTooltip: 'slatecamp-3dlab:onboarding:v1:viewport-tooltip-seen',
  module: (moduleId: string) => `slatecamp-3dlab:onboarding:v1:module:${moduleId}:seen`,
} as const

const LEGACY_GLOBAL_KEYS = ['3dlab_onboarded']
const LEGACY_VIEWPORT_TOOLTIP_KEYS = ['slatecamp-viewport-onboarding-seen']
const legacyModuleKey = (moduleId: string) => `module_${moduleId}_seen`

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'complete', 'completed'])

const safeLocalStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const readStorageFlag = (storage: FlagStorage | null, keys: string[]) => {
  if (!storage) return false

  for (const key of keys) {
    try {
      const value = storage.getItem(key)
      if (value && TRUE_VALUES.has(value.toLowerCase())) return true
    } catch {
      return false
    }
  }

  return false
}

const writeStorageFlag = (storage: FlagStorage | null, keys: string[]) => {
  if (!storage) return

  for (const key of keys) {
    try {
      storage.setItem(key, 'true')
    } catch {
      return
    }
  }
}

export const globalOnboardingKeys = () => [
  THREE_D_LAB_ONBOARDING_KEYS.global,
  ...LEGACY_GLOBAL_KEYS,
]

export const moduleOnboardingKeys = (moduleId: string) => [
  THREE_D_LAB_ONBOARDING_KEYS.module(moduleId),
  legacyModuleKey(moduleId),
]

export const viewportTooltipKeys = () => [
  THREE_D_LAB_ONBOARDING_KEYS.viewportTooltip,
  ...LEGACY_VIEWPORT_TOOLTIP_KEYS,
]

export const resolveInitial3DLabOnboardingOverlay = ({
  globalComplete,
  moduleSeen,
}: {
  globalComplete: boolean
  moduleSeen: boolean
}): ThreeDLabOnboardingOverlay => {
  if (!globalComplete) return 'global'
  if (!moduleSeen) return 'module'
  return 'none'
}

export const hasCompletedGlobal3DLabOnboarding = (storage = safeLocalStorage()) =>
  readStorageFlag(storage, globalOnboardingKeys())

export const markGlobal3DLabOnboardingComplete = (storage = safeLocalStorage()) => {
  writeStorageFlag(storage, globalOnboardingKeys())
  record3DLabOnboardingEvent({ event: 'global-completed' })
}

export const hasSeen3DLabModule = (moduleId: string, storage = safeLocalStorage()) =>
  readStorageFlag(storage, moduleOnboardingKeys(moduleId))

export const mark3DLabModuleSeen = (moduleId: string, storage = safeLocalStorage()) => {
  writeStorageFlag(storage, moduleOnboardingKeys(moduleId))
  record3DLabOnboardingEvent({ event: 'module-seen', moduleId })
}

export const hasSeen3DLabViewportTooltip = (storage = safeLocalStorage()) =>
  readStorageFlag(storage, viewportTooltipKeys())

export const mark3DLabViewportTooltipSeen = (storage = safeLocalStorage()) => {
  writeStorageFlag(storage, viewportTooltipKeys())
  record3DLabOnboardingEvent({ event: 'viewport-tooltip-seen' })
}

export const resolve3DLabOnboardingOverlayForModule = (moduleId: string) =>
  resolveInitial3DLabOnboardingOverlay({
    globalComplete: hasCompletedGlobal3DLabOnboarding(),
    moduleSeen: hasSeen3DLabModule(moduleId),
  })

export const record3DLabOnboardingEvent = (event: Omit<OnboardingEvent, 'timestamp'>) => {
  if (typeof window === 'undefined') return

  const state = window.__slatecamp3dLabOnboarding ?? {
    activeOverlay: 'none' as ThreeDLabOnboardingOverlay,
    events: [],
  }

  if (event.overlay) state.activeOverlay = event.overlay
  if (event.moduleId) state.activeModuleId = event.moduleId

  state.events.push({
    ...event,
    timestamp: new Date().toISOString(),
  })

  window.__slatecamp3dLabOnboarding = state
}
