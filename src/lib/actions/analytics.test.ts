/// <reference types="bun-types" />
import { expect, test, describe, mock, beforeEach } from "bun:test"

// ── Mock @/lib/supabase/server before importing the module under test ─────────
// bun:test hoists mock.module calls, so this executes before the analytics
// module is resolved.

let mockUser: { id: string } | null = { id: "user-test-123" }

// Supabase query builder stub — returns a chainable object ending in error/data
const makeQueryStub = (result: { data: unknown; error: unknown }) => {
  const chain: Record<string, unknown> = {}
  const methods = [
    "select", "eq", "neq", "gt", "gte", "lt", "lte",
    "order", "limit", "in", "not", "is", "single", "maybeSingle",
  ]
  for (const m of methods) {
    chain[m] = () => chain
  }
  // Terminal: awaiting the chain resolves to the stub result
  chain.then = (resolve: (v: unknown) => void) => resolve(result)
  return chain
}

const makeFromStub = (result: { data: unknown; error: unknown }) => () => makeQueryStub(result)

// Default stubs — all succeed with empty data
let fromImpl: (table: string) => ReturnType<typeof makeQueryStub>

const resetFromImpl = () => {
  fromImpl = (_table: string) => makeQueryStub({ data: [], error: null })
}

mock.module("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (table: string) => fromImpl(table),
  }),
  getUser: async () => ({
    data: { user: mockUser },
    error: null,
  }),
}))

// Import AFTER mock.module registration
import {
  getTaxonomyHeatmap,
  getReadinessTrajectory,
} from "./analytics"

// ── Helpers ──────────────────────────────────────────────────────────────────

const makeErrorStub = (message: string) =>
  makeQueryStub({ data: null, error: { message } })

const makeDataStub = (data: unknown) =>
  makeQueryStub({ data, error: null })

// ── getTaxonomyHeatmap ────────────────────────────────────────────────────────

describe("getTaxonomyHeatmap", () => {
  beforeEach(() => {
    mockUser = { id: "user-test-123" }
    resetFromImpl()
  })

  test("returns [] when user is not logged in", async () => {
    mockUser = null
    const result = await getTaxonomyHeatmap("discipline-abc")
    expect(result).toEqual([])
  })

  test("returns [] when the taxonomy_tree query errors", async () => {
    fromImpl = (_table: string) => makeErrorStub("connection timeout")
    const result = await getTaxonomyHeatmap("discipline-abc")
    expect(result).toEqual([])
  })

  test("returns [] when taxonomy_tree returns null data", async () => {
    fromImpl = (_table: string) => makeQueryStub({ data: null, error: null })
    const result = await getTaxonomyHeatmap("discipline-abc")
    expect(result).toEqual([])
  })

  test("returns [] when taxonomy_tree returns empty array", async () => {
    // First call (tree) returns no nodes — mastery call also returns empty
    fromImpl = (_table: string) => makeDataStub([])
    const result = await getTaxonomyHeatmap("discipline-abc")
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(0)
  })

  test("returns clusters shaped correctly when tree and mastery data are present", async () => {
    const nodes = [
      { node_id: "parent-1", name: "Structures", level: 1, parent_id: null },
      { node_id: "child-1",  name: "Beams",      level: 2, parent_id: "parent-1" },
    ]
    const mastery = [
      { topic_id: "child-1", current_mastery_weight: 0.9, distinct_questions_seen: 10 },
    ]

    let callCount = 0
    fromImpl = (_table: string) => {
      callCount++
      // First from() call is the tree query; second is mastery
      if (callCount === 1) return makeDataStub(nodes)
      return makeDataStub(mastery)
    }

    const result = await getTaxonomyHeatmap("discipline-abc")
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(1)
    expect(result[0].id).toBe("parent-1")
    expect(result[0].title).toBe("Structures")
    expect(result[0].nodes.length).toBe(1)
    expect(result[0].nodes[0].state).toBe("mastered")
    expect(result[0].nodes[0].progress).toBe(90)
  })
})

// ── getReadinessTrajectory ────────────────────────────────────────────────────

describe("getReadinessTrajectory", () => {
  beforeEach(() => {
    mockUser = { id: "user-test-123" }
    resetFromImpl()
  })

  test("returns [] when user is not logged in", async () => {
    mockUser = null
    const result = await getReadinessTrajectory()
    expect(result.data).toEqual([])
  })

  test("returns [] when no snapshot data exists", async () => {
    fromImpl = (_table: string) => makeDataStub([])
    const result = await getReadinessTrajectory()
    expect(result.data).toEqual([])
  })

  test("returns [] when snapshot query returns null", async () => {
    fromImpl = (_table: string) => makeDataStub(null)
    const result = await getReadinessTrajectory()
    expect(result.data).toEqual([])
  })

  test("maps snapshots to trajectory points with correct shape", async () => {
    const snapshots = [
      { score: 55.7, computed_at: "2026-03-01T00:00:00Z" },
      { score: 62.3, computed_at: "2026-03-08T00:00:00Z" },
      { score: 68.1, computed_at: "2026-03-15T00:00:00Z" },
    ]
    fromImpl = (_table: string) => makeDataStub(snapshots)

    const result = await getReadinessTrajectory()
    expect(Array.isArray(result.data)).toBe(true)
    expect(result.data.length).toBe(3)

    const point = result.data[0]
    expect(typeof point.date).toBe("string")
    expect(typeof point.score).toBe("number")
    expect(typeof point.target).toBe("number")
    // score should be rounded
    expect(Number.isInteger(point.score)).toBe(true)
  })

  test("rounds scores to integers", async () => {
    const snapshots = [{ score: 73.6, computed_at: "2026-03-10T00:00:00Z" }]
    fromImpl = (_table: string) => makeDataStub(snapshots)

    const result = await getReadinessTrajectory()
    expect(result.data[0].score).toBe(74)
  })
})
