import { describe, expect, test, beforeEach } from 'bun:test'
import {
  useNavigationPendingStore,
  resetNavigationPendingStore,
  NAVIGATION_TIMEOUT_MS,
} from '@/stores/useNavigationPendingStore'

// ─── Helpers ────────────────────────────────────────────────────────────────

function resetStore() {
  resetNavigationPendingStore()
}

// ─── Store Tests ────────────────────────────────────────────────────────────

describe('useNavigationPendingStore', () => {
  beforeEach(() => {
    resetStore()
  })

  test('initial state has no pending navigation', () => {
    const state = useNavigationPendingStore.getState()
    expect(state.pendingHref).toBeNull()
    expect(state.pendingId).toBeNull()
    expect(state.startedAt).toBeNull()
    expect(state.label).toBeNull()
    expect(state.isNavigating()).toBe(false)
  })

  test('startNavigation sets pending state', () => {
    const store = useNavigationPendingStore.getState()
    store.startNavigation('/dashboard/3d-lab', { id: '3d-lab', label: '3D Lab' })

    const updated = useNavigationPendingStore.getState()
    expect(updated.pendingHref).toBe('/dashboard/3d-lab')
    expect(updated.pendingId).toBe('3d-lab')
    expect(updated.label).toBe('3D Lab')
    expect(updated.startedAt).not.toBeNull()
    expect(typeof updated.startedAt).toBe('number')
    expect(updated.isNavigating()).toBe(true)
  })

  test('startNavigation without options sets nullable fields', () => {
    const store = useNavigationPendingStore.getState()
    store.startNavigation('/dashboard/wiki')

    const updated = useNavigationPendingStore.getState()
    expect(updated.pendingHref).toBe('/dashboard/wiki')
    expect(updated.pendingId).toBeNull()
    expect(updated.label).toBeNull()
  })

  test('finishNavigation resets to initial state', () => {
    const store = useNavigationPendingStore.getState()
    store.startNavigation('/dashboard/3d-lab', { id: '3d-lab' })
    expect(store.isNavigating()).toBe(true)

    useNavigationPendingStore.getState().finishNavigation()

    const updated = useNavigationPendingStore.getState()
    expect(updated.pendingHref).toBeNull()
    expect(updated.pendingId).toBeNull()
    expect(updated.startedAt).toBeNull()
    expect(updated.label).toBeNull()
    expect(updated.isNavigating()).toBe(false)
  })

  test('isPendingHref returns true only for the exact pending href', () => {
    const store = useNavigationPendingStore.getState()
    store.startNavigation('/dashboard/3d-lab')

    expect(useNavigationPendingStore.getState().isPendingHref('/dashboard/3d-lab')).toBe(true)
    expect(useNavigationPendingStore.getState().isPendingHref('/dashboard/wiki')).toBe(false)
    expect(useNavigationPendingStore.getState().isPendingHref('/dashboard/3d-lab/some-child')).toBe(false)
  })

  test('isPendingHref returns false when nothing is pending', () => {
    expect(useNavigationPendingStore.getState().isPendingHref('/anything')).toBe(false)
  })

  test('isNavigating reflects current state', () => {
    expect(useNavigationPendingStore.getState().isNavigating()).toBe(false)

    useNavigationPendingStore.getState().startNavigation('/dashboard/wiki')
    expect(useNavigationPendingStore.getState().isNavigating()).toBe(true)

    useNavigationPendingStore.getState().finishNavigation()
    expect(useNavigationPendingStore.getState().isNavigating()).toBe(false)
  })

  test('startNavigation updates startedAt timestamp', () => {
    const before = Date.now()
    useNavigationPendingStore.getState().startNavigation('/test')
    const after = Date.now()
    const startedAt = useNavigationPendingStore.getState().startedAt

    // Just validate it exists and is reasonable
    expect(typeof startedAt).toBe('number')
    expect(startedAt).toBeGreaterThanOrEqual(before)
    expect(startedAt).toBeLessThanOrEqual(after)
  })

  test('NAVIGATION_TIMEOUT_MS is 10 seconds', () => {
    expect(NAVIGATION_TIMEOUT_MS).toBe(10_000)
  })

  test('calling startNavigation twice overwrites the first', () => {
    const store = useNavigationPendingStore.getState()
    store.startNavigation('/first', { id: 'first' })
    store.startNavigation('/second', { id: 'second' })

    const updated = useNavigationPendingStore.getState()
    expect(updated.pendingHref).toBe('/second')
    expect(updated.pendingId).toBe('second')
  })

  test('resetNavigationPendingStore clears all state', () => {
    useNavigationPendingStore.getState().startNavigation('/test', { id: 'test' })
    expect(useNavigationPendingStore.getState().isNavigating()).toBe(true)

    resetNavigationPendingStore()

    const state = useNavigationPendingStore.getState()
    expect(state.pendingHref).toBeNull()
    expect(state.pendingId).toBeNull()
    expect(state.isNavigating()).toBe(false)
  })
})
