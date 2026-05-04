import { describe, expect, test, beforeEach, afterEach, mock } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { useGlobalLoadingStore, generateOperationId } from '@/stores/useGlobalLoadingStore'

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Reset the store between tests by hiding all operations.
 * We cannot call .reset() since it doesn't exist, so we call hide
 * for every active operation.
 */
function resetStore() {
  const state = useGlobalLoadingStore.getState()
  for (const op of state.operations) {
    state.hide(op.id)
  }
}

// ─── Store Tests ────────────────────────────────────────────────────────────

describe('useGlobalLoadingStore', () => {
  beforeEach(() => {
    resetStore()
  })

  test('show() adds an operation and makes the overlay visible', () => {
    const store = useGlobalLoadingStore.getState()

    expect(store.operations).toHaveLength(0)
    expect(store.visible).toBe(false)

    store.show('test-1', 'Loading test…')

    const updated = useGlobalLoadingStore.getState()
    expect(updated.operations).toHaveLength(1)
    expect(updated.operations[0].id).toBe('test-1')
    expect(updated.operations[0].message).toBe('Loading test…')
    expect(updated.visible).toBe(true)
    expect(updated.activeMessage).toBe('Loading test…')
  })

  test('hide() removes an operation and hides overlay when no operations remain', () => {
    const store = useGlobalLoadingStore.getState()
    store.show('test-1', 'First')
    store.show('test-2', 'Second')

    expect(useGlobalLoadingStore.getState().operations).toHaveLength(2)

    useGlobalLoadingStore.getState().hide('test-1')
    expect(useGlobalLoadingStore.getState().operations).toHaveLength(1)

    // Still visible because test-2 is still active
    expect(useGlobalLoadingStore.getState().visible).toBe(true)
    expect(useGlobalLoadingStore.getState().activeMessage).toBe('Second')

    useGlobalLoadingStore.getState().hide('test-2')
    expect(useGlobalLoadingStore.getState().operations).toHaveLength(0)
    expect(useGlobalLoadingStore.getState().visible).toBe(false)
    expect(useGlobalLoadingStore.getState().activeMessage).toBe('Loading…')
  })

  test('concurrent operations: hiding one does not hide others', () => {
    const store = useGlobalLoadingStore.getState()
    store.show('op-a', 'Operation A')
    store.show('op-b', 'Operation B')
    store.show('op-c', 'Operation C')

    expect(useGlobalLoadingStore.getState().operations).toHaveLength(3)

    // Hide B — A and C should remain
    useGlobalLoadingStore.getState().hide('op-b')
    const remaining = useGlobalLoadingStore.getState().operations
    expect(remaining).toHaveLength(2)
    expect(remaining.map((op) => op.id).sort()).toEqual(['op-a', 'op-c'])
    expect(useGlobalLoadingStore.getState().visible).toBe(true)

    // Hide all remaining
    useGlobalLoadingStore.getState().hide('op-a')
    useGlobalLoadingStore.getState().hide('op-c')
    expect(useGlobalLoadingStore.getState().operations).toHaveLength(0)
    expect(useGlobalLoadingStore.getState().visible).toBe(false)
  })

  test('show() with duplicate ID is idempotent', () => {
    const store = useGlobalLoadingStore.getState()
    store.show('dup-id', 'First')
    store.show('dup-id', 'Second')

    // Should still only have 1 operation
    expect(useGlobalLoadingStore.getState().operations).toHaveLength(1)
    expect(useGlobalLoadingStore.getState().activeMessage).toBe('First')
  })

  test('isActive() returns correct state', () => {
    expect(useGlobalLoadingStore.getState().isActive()).toBe(false)

    useGlobalLoadingStore.getState().show('check', 'Test')
    expect(useGlobalLoadingStore.getState().isActive()).toBe(true)

    useGlobalLoadingStore.getState().hide('check')
    expect(useGlobalLoadingStore.getState().isActive()).toBe(false)
  })

  test('show() uses default message when none provided', () => {
    useGlobalLoadingStore.getState().show('default-msg')
    expect(useGlobalLoadingStore.getState().activeMessage).toBe('Loading…')

    useGlobalLoadingStore.getState().hide('default-msg')
  })
})

// ─── generateOperationId ────────────────────────────────────────────────────

describe('generateOperationId', () => {
  test('generates unique IDs', () => {
    const id1 = generateOperationId('test')
    const id2 = generateOperationId('test')
    expect(id1).not.toBe(id2)
  })

  test('includes prefix', () => {
    const id = generateOperationId('my-prefix')
    expect(id).toStartWith('my-prefix-')
  })

  test('defaults to "loading" prefix', () => {
    const id = generateOperationId()
    expect(id).toStartWith('loading-')
  })
})
