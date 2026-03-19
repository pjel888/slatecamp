import { describe, test, expect, mock, beforeEach } from 'bun:test'

// ---------------------------------------------------------------------------
// Mutable state that each test can configure before the function runs.
// ---------------------------------------------------------------------------

type MockState = {
  existingQueue: { queue_id: string } | null
  weakNodes: Array<{ topic_id: string; current_mastery_weight: number }>
  allLeafNodes: Array<{ node_id: string }>
  touchedNodes: Array<{ topic_id: string }>
  insertResult: { data: { queue_id: string } | null; error: { message: string } | null }
}

const state: MockState = {
  existingQueue: null,
  weakNodes: [],
  allLeafNodes: [],
  touchedNodes: [],
  insertResult: { data: { queue_id: 'queue-abc-123' }, error: null },
}

// Track call order for user_node_mastery across from() calls
let masteryCallCount = 0

// ---------------------------------------------------------------------------
// Chainable query builder that is also awaitable (implements .then)
// ---------------------------------------------------------------------------

const makeChain = (resolver: () => Promise<unknown>): Record<string, unknown> => {
  const wrap = () => makeChain(resolver)
  const chain: Record<string, unknown> = {
    eq: mock(wrap),
    in: mock(wrap),
    not: mock(wrap),
    is: mock(wrap),
    lt: mock(wrap),
    order: mock(wrap),
    limit: mock(wrap),
    select: mock(wrap),
    insert: mock(wrap),
    update: mock(wrap),
    maybeSingle: mock(() => resolver()),
    single: mock(() => resolver()),
    // Make the chain awaitable — Supabase query builders are PromiseLike
    then: (resolve: (v: unknown) => void, reject?: (e: unknown) => void) =>
      resolver().then(resolve, reject),
  }
  return chain
}

const mockSupabaseClient = {
  from: mock((table: string) => {
    if (table === 'blindspot_queues') {
      return {
        select: mock(() =>
          makeChain(() => Promise.resolve({ data: state.existingQueue, error: null })),
        ),
        insert: mock(() =>
          makeChain(() => Promise.resolve(state.insertResult)),
        ),
      }
    }

    if (table === 'user_node_mastery') {
      // Two distinct queries hit this table per function call:
      //   1. weak nodes (lt + order + limit)
      //   2. touched nodes (just eq)
      // We use a shared counter that persists across from() calls
      const currentCall = ++masteryCallCount
      return {
        select: mock(() => {
          if (currentCall % 2 === 1) {
            return makeChain(() => Promise.resolve({ data: state.weakNodes, error: null }))
          }
          return makeChain(() => Promise.resolve({ data: state.touchedNodes, error: null }))
        }),
      }
    }

    if (table === 'taxonomy_tree') {
      return {
        select: mock(() =>
          makeChain(() => Promise.resolve({ data: state.allLeafNodes, error: null })),
        ),
      }
    }

    return {
      select: mock(() =>
        makeChain(() => Promise.resolve({ data: null, error: null })),
      ),
    }
  }),
}

mock.module('@/lib/supabase/server', () => ({
  createClient: mock(() => Promise.resolve(mockSupabaseClient)),
}))

import { generateBlindspotQueue } from './generate-queue'

// ---------------------------------------------------------------------------

const resetState = () => {
  state.existingQueue = null
  state.weakNodes = []
  state.allLeafNodes = []
  state.touchedNodes = []
  state.insertResult = { data: { queue_id: 'queue-abc-123' }, error: null }
  masteryCallCount = 0
}

// ---------------------------------------------------------------------------
// Active queue guard
// ---------------------------------------------------------------------------
describe('generateBlindspotQueue — active queue guard', () => {
  beforeEach(resetState)

  test('returns null when user already has a pending queue', async () => {
    state.existingQueue = { queue_id: 'existing-queue-id' }
    const result = await generateBlindspotQueue('user-1')
    expect(result).toBeNull()
  })

  test('returns null when user already has an in_progress queue', async () => {
    state.existingQueue = { queue_id: 'in-progress-queue-id' }
    const result = await generateBlindspotQueue('user-1')
    expect(result).toBeNull()
  })

  test('does not return null when no active queue exists and weak nodes are present', async () => {
    state.existingQueue = null
    state.weakNodes = [{ topic_id: 'node-weak-1', current_mastery_weight: 0.1 }]
    state.insertResult = { data: { queue_id: 'new-queue-id' }, error: null }
    const result = await generateBlindspotQueue('user-1')
    expect(result).not.toBeNull()
  })
})

// ---------------------------------------------------------------------------
// No weak nodes (perfect mastery)
// ---------------------------------------------------------------------------
describe('generateBlindspotQueue — no weak nodes', () => {
  beforeEach(resetState)

  test('returns null when user has no weak nodes and no grey (untouched) nodes', async () => {
    state.weakNodes = []
    state.allLeafNodes = [{ node_id: 'leaf-1' }, { node_id: 'leaf-2' }]
    state.touchedNodes = [{ topic_id: 'leaf-1' }, { topic_id: 'leaf-2' }]
    const result = await generateBlindspotQueue('user-1')
    expect(result).toBeNull()
  })

  test('returns null when both weakNodes and allLeafNodes are empty', async () => {
    state.weakNodes = []
    state.allLeafNodes = []
    state.touchedNodes = []
    const result = await generateBlindspotQueue('user-1')
    expect(result).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Queue creation
// ---------------------------------------------------------------------------
describe('generateBlindspotQueue — queue creation', () => {
  beforeEach(resetState)

  test('returns queueId and nodeIds on successful insert', async () => {
    state.weakNodes = [
      { topic_id: 'node-1', current_mastery_weight: 0.1 },
      { topic_id: 'node-2', current_mastery_weight: 0.2 },
    ]
    state.insertResult = { data: { queue_id: 'queue-xyz' }, error: null }

    const result = await generateBlindspotQueue('user-1')
    expect(result).not.toBeNull()
    expect(result?.queueId).toBe('queue-xyz')
    expect(result?.nodeIds).toContain('node-1')
    expect(result?.nodeIds).toContain('node-2')
  })

  test('includes only weak node ids when no grey nodes', async () => {
    state.weakNodes = [
      { topic_id: 'weak-a', current_mastery_weight: 0.05 },
      { topic_id: 'weak-b', current_mastery_weight: 0.15 },
    ]
    state.allLeafNodes = [{ node_id: 'weak-a' }, { node_id: 'weak-b' }]
    state.touchedNodes = [{ topic_id: 'weak-a' }, { topic_id: 'weak-b' }]
    state.insertResult = { data: { queue_id: 'queue-weak-only' }, error: null }

    const result = await generateBlindspotQueue('user-1')
    expect(result).not.toBeNull()
    expect(result!.nodeIds).toEqual(['weak-a', 'weak-b'])
  })

  test('includes grey (untouched) nodes when fewer than 3 weak nodes', async () => {
    state.weakNodes = [{ topic_id: 'weak-1', current_mastery_weight: 0.3 }]
    state.allLeafNodes = [
      { node_id: 'weak-1' },
      { node_id: 'grey-1' },
      { node_id: 'grey-2' },
    ]
    state.touchedNodes = [{ topic_id: 'weak-1' }]
    state.insertResult = { data: { queue_id: 'queue-mixed' }, error: null }

    const result = await generateBlindspotQueue('user-1')
    expect(result).not.toBeNull()
    expect(result!.nodeIds).toContain('weak-1')
    expect(result!.nodeIds).toContain('grey-1')
    expect(result!.nodeIds.length).toBeGreaterThanOrEqual(2)
  })

  test('returns null when the insert call returns an error', async () => {
    state.weakNodes = [{ topic_id: 'node-err', current_mastery_weight: 0.2 }]
    state.insertResult = { data: null, error: { message: 'insert constraint violation' } }
    const result = await generateBlindspotQueue('user-1')
    expect(result).toBeNull()
  })

  test('returns null when insert data is null', async () => {
    state.weakNodes = [{ topic_id: 'node-null', current_mastery_weight: 0.3 }]
    state.insertResult = { data: null, error: null }
    const result = await generateBlindspotQueue('user-1')
    expect(result).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// 3-node cap
// ---------------------------------------------------------------------------
describe('generateBlindspotQueue — caps at 3 target nodes', () => {
  beforeEach(resetState)

  test('nodeIds length is at most 3 when 3 weak nodes provided', async () => {
    state.weakNodes = [
      { topic_id: 'n1', current_mastery_weight: 0.05 },
      { topic_id: 'n2', current_mastery_weight: 0.10 },
      { topic_id: 'n3', current_mastery_weight: 0.15 },
    ]
    state.insertResult = { data: { queue_id: 'queue-capped' }, error: null }

    const result = await generateBlindspotQueue('user-1')
    expect(result).not.toBeNull()
    expect(result!.nodeIds.length).toBeLessThanOrEqual(3)
  })

  test('nodeIds capped at 3 when weak + grey exceed 3', async () => {
    state.weakNodes = [
      { topic_id: 'weak-x', current_mastery_weight: 0.1 },
      { topic_id: 'weak-y', current_mastery_weight: 0.2 },
    ]
    state.allLeafNodes = [
      { node_id: 'weak-x' },
      { node_id: 'weak-y' },
      { node_id: 'grey-a' },
      { node_id: 'grey-b' },
      { node_id: 'grey-c' },
      { node_id: 'grey-d' },
    ]
    state.touchedNodes = [{ topic_id: 'weak-x' }, { topic_id: 'weak-y' }]
    state.insertResult = { data: { queue_id: 'queue-cap-mixed' }, error: null }

    const result = await generateBlindspotQueue('user-1')
    expect(result).not.toBeNull()
    expect(result!.nodeIds.length).toBeLessThanOrEqual(3)
  })

  test('nodeIds length equals 1 when only a single weak node', async () => {
    state.weakNodes = [{ topic_id: 'solo-node', current_mastery_weight: 0.05 }]
    state.allLeafNodes = [{ node_id: 'solo-node' }]
    state.touchedNodes = [{ topic_id: 'solo-node' }]
    state.insertResult = { data: { queue_id: 'queue-solo' }, error: null }

    const result = await generateBlindspotQueue('user-1')
    expect(result).not.toBeNull()
    expect(result!.nodeIds.length).toBe(1)
    expect(result!.nodeIds[0]).toBe('solo-node')
  })

  test('nodeIds = 3 when 2 weak + 1 grey node', async () => {
    state.weakNodes = [
      { topic_id: 'w1', current_mastery_weight: 0.1 },
      { topic_id: 'w2', current_mastery_weight: 0.2 },
    ]
    state.allLeafNodes = [
      { node_id: 'w1' },
      { node_id: 'w2' },
      { node_id: 'g1' },
    ]
    state.touchedNodes = [{ topic_id: 'w1' }, { topic_id: 'w2' }]
    state.insertResult = { data: { queue_id: 'queue-full' }, error: null }

    const result = await generateBlindspotQueue('user-1')
    expect(result).not.toBeNull()
    expect(result!.nodeIds.length).toBe(3)
    expect(result!.nodeIds).toContain('w1')
    expect(result!.nodeIds).toContain('w2')
    expect(result!.nodeIds).toContain('g1')
  })
})

// ---------------------------------------------------------------------------
// Grey node discovery
// ---------------------------------------------------------------------------
describe('generateBlindspotQueue — grey node discovery', () => {
  beforeEach(resetState)

  test('only includes untouched leaf nodes as grey nodes', async () => {
    state.weakNodes = []
    state.allLeafNodes = [
      { node_id: 'touched-1' },
      { node_id: 'untouched-1' },
      { node_id: 'touched-2' },
      { node_id: 'untouched-2' },
    ]
    state.touchedNodes = [{ topic_id: 'touched-1' }, { topic_id: 'touched-2' }]
    state.insertResult = { data: { queue_id: 'queue-grey' }, error: null }

    const result = await generateBlindspotQueue('user-1')
    expect(result).not.toBeNull()
    expect(result!.nodeIds).not.toContain('touched-1')
    expect(result!.nodeIds).not.toContain('touched-2')
    expect(result!.nodeIds).toContain('untouched-1')
    expect(result!.nodeIds).toContain('untouched-2')
  })

  test('returns null when all leaf nodes touched and mastery above threshold', async () => {
    state.weakNodes = []
    state.allLeafNodes = [{ node_id: 'leaf-covered' }]
    state.touchedNodes = [{ topic_id: 'leaf-covered' }]

    const result = await generateBlindspotQueue('user-1')
    expect(result).toBeNull()
  })
})
