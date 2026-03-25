/// <reference types="bun-types" />
import { expect, test, describe, mock, beforeEach } from "bun:test"

// ── Mock @/lib/supabase/server ────────────────────────────────────────────────
// getDashboardPageData returns emptyDashboard immediately when getUser() resolves
// to a null user. We keep a mutable reference so individual tests can override it.

let mockUser: { id: string; user_metadata?: Record<string, unknown>; email?: string } | null = null

mock.module("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (_table: string) => {
      // A fully chainable stub that resolves to empty safe defaults
      const chain: Record<string, unknown> = {}
      const methods = [
        "select", "eq", "neq", "gt", "gte", "lt", "lte",
        "in", "not", "is", "order", "limit", "single", "maybeSingle",
      ]
      for (const m of methods) {
        chain[m] = () => chain
      }
      chain.then = (resolve: (v: unknown) => void) =>
        resolve({ data: null, error: null, count: 0 })
      return chain
    },
  }),
  getUser: async () => ({
    data: { user: mockUser },
    error: null,
  }),
}))

// Import AFTER mock.module registration
import { getDashboardPageData } from "./dashboard-page"
import type { DashboardPageData } from "@/types/dashboard"

// ── emptyDashboard shape contract ─────────────────────────────────────────────

describe("getDashboardPageData — unauthenticated path", () => {
  beforeEach(() => {
    mockUser = null
  })

  test("returns emptyDashboard when user is null", async () => {
    const data = await getDashboardPageData()
    expect(data).not.toBeNull()
    expect(typeof data).toBe("object")
  })

  test("readinessScore defaults to 0", async () => {
    const data = await getDashboardPageData()
    expect(data.readinessScore).toBe(0)
  })

  test("previousScore defaults to null", async () => {
    const data = await getDashboardPageData()
    expect(data.previousScore).toBeNull()
  })

  test("examDate defaults to null", async () => {
    const data = await getDashboardPageData()
    expect(data.examDate).toBeNull()
  })

  test("daysUntilExam defaults to null", async () => {
    const data = await getDashboardPageData()
    expect(data.daysUntilExam).toBeNull()
  })

  test("syllabusCoveragePercent defaults to 0", async () => {
    const data = await getDashboardPageData()
    expect(data.syllabusCoveragePercent).toBe(0)
  })

  test("readinessMeta defaults to null", async () => {
    const data = await getDashboardPageData()
    expect(data.readinessMeta).toBeNull()
  })

  test("focusAreas defaults to empty array", async () => {
    const data = await getDashboardPageData()
    expect(Array.isArray(data.focusAreas)).toBe(true)
    expect(data.focusAreas.length).toBe(0)
  })

  test("subjectMastery defaults to empty array", async () => {
    const data = await getDashboardPageData()
    expect(Array.isArray(data.subjectMastery)).toBe(true)
    expect(data.subjectMastery.length).toBe(0)
  })

  test("subjectFloorAlerts defaults to empty array", async () => {
    const data = await getDashboardPageData()
    expect(Array.isArray(data.subjectFloorAlerts)).toBe(true)
    expect(data.subjectFloorAlerts.length).toBe(0)
  })

  test("recentSessions defaults to empty array", async () => {
    const data = await getDashboardPageData()
    expect(Array.isArray(data.recentSessions)).toBe(true)
    expect(data.recentSessions.length).toBe(0)
  })

  test("recentNotes defaults to empty array", async () => {
    const data = await getDashboardPageData()
    expect(Array.isArray(data.recentNotes)).toBe(true)
    expect(data.recentNotes.length).toBe(0)
  })

  test("inProgressSession defaults to null", async () => {
    const data = await getDashboardPageData()
    expect(data.inProgressSession).toBeNull()
  })

  test("dailyArticle defaults to null", async () => {
    const data = await getDashboardPageData()
    expect(data.dailyArticle).toBeNull()
  })

  test("labModuleCount defaults to 0", async () => {
    const data = await getDashboardPageData()
    expect(data.labModuleCount).toBe(0)
  })

  test("scoreUpdatesSinceReveal defaults to 0", async () => {
    const data = await getDashboardPageData()
    expect(data.scoreUpdatesSinceReveal).toBe(0)
  })

  test("isFreeUser defaults to true", async () => {
    const data = await getDashboardPageData()
    expect(data.isFreeUser).toBe(true)
  })

  test("activeTrailDay defaults to null", async () => {
    const data = await getDashboardPageData()
    expect(data.activeTrailDay).toBeNull()
  })

  test("onboardingState defaults to needs_assessment", async () => {
    const data = await getDashboardPageData()
    expect(data.onboardingState).toBe("needs_assessment")
  })
})

// ── heroStats array shape ────────────────────────────────────────────────────

describe("emptyDashboard — heroStats shape", () => {
  beforeEach(() => {
    mockUser = null
  })

  test("heroStats contains exactly 3 entries", async () => {
    const data = await getDashboardPageData()
    expect(data.heroStats.length).toBe(3)
  })

  test("all heroStat values are 0", async () => {
    const data = await getDashboardPageData()
    for (const stat of data.heroStats) {
      expect(stat.value).toBe(0)
    }
  })

  test("all heroStat deltas are null", async () => {
    const data = await getDashboardPageData()
    for (const stat of data.heroStats) {
      expect(stat.delta).toBeNull()
    }
  })

  test("heroStats labels match expected values", async () => {
    const data = await getDashboardPageData()
    const labels = data.heroStats.map((s) => s.label)
    expect(labels).toContain("Questions answered")
    expect(labels).toContain("Topics studied")
    expect(labels).toContain("Study days")
  })
})

// ── weekStats array shape ────────────────────────────────────────────────────

describe("emptyDashboard — weekStats shape", () => {
  beforeEach(() => {
    mockUser = null
  })

  test("weekStats contains exactly 3 entries", async () => {
    const data = await getDashboardPageData()
    expect(data.weekStats.length).toBe(3)
  })

  test("all weekStat values are 0", async () => {
    const data = await getDashboardPageData()
    for (const stat of data.weekStats) {
      expect(stat.value).toBe(0)
    }
  })

  test("all weekStat deltas are null", async () => {
    const data = await getDashboardPageData()
    for (const stat of data.weekStats) {
      expect(stat.delta).toBeNull()
    }
  })
})

// ── streak shape ─────────────────────────────────────────────────────────────

describe("emptyDashboard — streak shape", () => {
  beforeEach(() => {
    mockUser = null
  })

  test("streak.currentStreak defaults to 0", async () => {
    const data = await getDashboardPageData()
    expect(data.streak.currentStreak).toBe(0)
  })

  test("streak.longestStreak defaults to 0", async () => {
    const data = await getDashboardPageData()
    expect(data.streak.longestStreak).toBe(0)
  })

  test("streak.streakStatus defaults to broken", async () => {
    const data = await getDashboardPageData()
    expect(data.streak.streakStatus).toBe("broken")
  })
})

// ── srsReview shape ───────────────────────────────────────────────────────────

describe("emptyDashboard — srsReview shape", () => {
  beforeEach(() => {
    mockUser = null
  })

  test("srsReview.itemsDue defaults to 0", async () => {
    const data = await getDashboardPageData()
    expect(data.srsReview.itemsDue).toBe(0)
  })

  test("srsReview.subjects defaults to empty array", async () => {
    const data = await getDashboardPageData()
    expect(Array.isArray(data.srsReview.subjects)).toBe(true)
    expect(data.srsReview.subjects.length).toBe(0)
  })

  test("srsReview.estimatedMinutes defaults to 0", async () => {
    const data = await getDashboardPageData()
    expect(data.srsReview.estimatedMinutes).toBe(0)
  })
})

// ── action shape ──────────────────────────────────────────────────────────────

describe("emptyDashboard — action shape", () => {
  beforeEach(() => {
    mockUser = null
  })

  test("action.type is warmup when no data", async () => {
    const data = await getDashboardPageData()
    expect(data.action.type).toBe("warmup")
  })

  test("action.href points to camp mode", async () => {
    const data = await getDashboardPageData()
    expect(data.action.href).toContain("/dashboard/testing")
  })

  test("action.estimatedMinutes is a positive number", async () => {
    const data = await getDashboardPageData()
    expect(data.action.estimatedMinutes).toBeGreaterThan(0)
  })

  test("action contains required string fields", async () => {
    const data = await getDashboardPageData()
    expect(typeof data.action.title).toBe("string")
    expect(data.action.title.length).toBeGreaterThan(0)
    expect(typeof data.action.subtitle).toBe("string")
    expect(typeof data.action.ctaLabel).toBe("string")
  })
})

// ── userName fallback ─────────────────────────────────────────────────────────

describe("emptyDashboard — userName fallback", () => {
  test("userName falls back to 'there' when user is null", async () => {
    mockUser = null
    const data = await getDashboardPageData()
    expect(data.userName).toBe("there")
  })
})
