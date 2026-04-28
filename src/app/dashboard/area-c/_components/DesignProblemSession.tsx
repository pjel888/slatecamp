"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Timer, Flag, WarningCircle } from "@phosphor-icons/react"
import { completeDesignSession } from "@/lib/actions/design-problems"
import { BPComplianceChecklist } from "./BPComplianceChecklist"
import type { DesignProblem, DesignProblemSession as Session } from "@/lib/actions/design-problems"
import { ROUTES } from "@/lib/routes"
import Link from "next/link"

// Three-hour goal in seconds
const THREE_HOURS_SECONDS = 3 * 60 * 60
// BP 344 checklist appears after 90 minutes
const CHECKLIST_REVEAL_SECONDS = 90 * 60

const formatElapsed = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [
    String(h).padStart(2, "0"),
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0"),
  ].join(":")
}

const SelfAssessmentModal = ({
  onSubmit,
  onDismiss,
}: {
  onSubmit: (score: number) => void
  onDismiss: () => void
}) => {
  const [selected, setSelected] = useState<number | null>(null)

  const SCALE_LABELS: Record<number, string> = {
    1: "Incomplete — major gaps",
    2: "Partial — key elements missing",
    3: "Adequate — most requirements met",
    4: "Good — minor omissions only",
    5: "Complete — all requirements addressed",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">How complete was your solution?</h2>
          <p className="text-xs text-muted-foreground mt-1">Rate honestly — this helps track your progress over time.</p>
        </div>

        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => setSelected(score)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-sm border text-left transition-colors duration-150 ease-out
                ${selected === score
                  ? "border-primary bg-primary-50"
                  : "border-border hover:border-primary/40 hover:bg-background"
                }
              `}
            >
              <span className={`text-sm font-bold shrink-0 w-4 ${selected === score ? "text-primary" : "text-muted-foreground"}`}>
                {score}
              </span>
              <span className="text-xs text-foreground leading-snug">{SCALE_LABELS[score]}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 rounded-sm border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-background transition-colors duration-150 ease-out"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={selected === null}
            onClick={() => selected !== null && onSubmit(selected)}
            className="flex-1 rounded-sm bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 ease-out"
          >
            Save & Finish
          </button>
        </div>
      </div>
    </div>
  )
}

type DesignProblemSessionProps = {
  problem: DesignProblem
  session: Session
}

export const DesignProblemSession = ({ problem, session }: DesignProblemSessionProps) => {
  const startedAt = useRef(new Date(session.started_at).getTime())
  const [elapsed, setElapsed] = useState(() =>
    Math.floor((Date.now() - startedAt.current) / 1000)
  )
  const [showAssessment, setShowAssessment] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [checklistCompletion, _setChecklistCompletion] = useState<Record<string, boolean>>(
    (session.checklist_completion ?? {}) as Record<string, boolean>
  )

  // Timer counts up from session start, cannot be paused
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const showChecklist = elapsed >= CHECKLIST_REVEAL_SECONDS

  const goalPercent = Math.min((elapsed / THREE_HOURS_SECONDS) * 100, 100)
  const isOverGoal = elapsed > THREE_HOURS_SECONDS
  const timeColor = isOverGoal ? "text-warning" : "text-foreground"

  const handleFinishClick = useCallback(() => {
    setShowAssessment(true)
  }, [])

  const handleAssessmentSubmit = useCallback(async (score: number) => {
    setShowAssessment(false)
    setCompleting(true)
    await completeDesignSession(
      session.session_id,
      elapsed,
      score,
      checklistCompletion
    )
    setCompleting(false)
    setCompleted(true)
  }, [session.session_id, elapsed, checklistCompletion])

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-12 h-12 rounded-full bg-success-50 flex items-center justify-center">
          <Flag size={24} className="text-success" weight="fill" />
        </div>
        <div className="text-center">
          <h2 className="text-base font-semibold text-foreground">Session complete</h2>
          <p className="text-sm text-muted-foreground mt-1">Your work has been saved. Time: {formatElapsed(elapsed)}</p>
        </div>
        <Link
          href={ROUTES.dashboard.designProblems}
          className="rounded-sm bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary-700 transition-colors duration-150 ease-out"
        >
          Back to Problem Library
        </Link>
      </div>
    )
  }

  return (
    <>
      {showAssessment && (
        <SelfAssessmentModal
          onSubmit={handleAssessmentSubmit}
          onDismiss={() => setShowAssessment(false)}
        />
      )}

      <div className="flex flex-col gap-4">
        {/* Timer bar */}
        <div className="rounded-md border border-border bg-card px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Timer size={16} className="text-primary shrink-0" />
            <span className="text-xs text-muted-foreground">Elapsed</span>
          </div>

          <div className="flex-1 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${isOverGoal ? "bg-warning" : "bg-primary"}`}
                style={{ width: `${goalPercent}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground shrink-0">3h goal</span>
          </div>

          <span className={`font-mono text-sm font-semibold tabular-nums ${timeColor}`}>
            {formatElapsed(elapsed)}
          </span>
        </div>

        {isOverGoal && (
          <div className="flex items-start gap-2 rounded-sm bg-warning-50 border border-warning/30 px-3 py-2.5">
            <WarningCircle size={14} className="text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-warning">
              You have exceeded the 3-hour goal. Consider wrapping up your solution.
            </p>
          </div>
        )}

        {/* Problem brief */}
        <div className="rounded-md border border-border bg-card p-4 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">Design Brief</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{problem.brief}</p>

          {/* Code references */}
          {problem.code_references.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {problem.code_references.map((ref) => (
                <span
                  key={ref}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-sm bg-primary-50 text-primary"
                >
                  {ref}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Program */}
        <div className="rounded-md border border-border bg-card p-4 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">Building Program</h2>
          <ProgramTable program={problem.program} />
        </div>

        {/* Site data */}
        <div className="rounded-md border border-border bg-card p-4 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">Site Data</h2>
          <SiteDataTable siteData={problem.site_data} />
        </div>

        {/* BP 344 checklist — appears after 90 minutes */}
        {showChecklist && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-sm bg-primary-50 text-primary">
                90-min checkpoint
              </span>
            </div>
            <BPComplianceChecklist
              sessionId={session.session_id}
              initialCompletion={checklistCompletion}
            />
          </div>
        )}

        {!showChecklist && (
          <div className="rounded-sm bg-background border border-border px-3 py-2.5">
            <p className="text-xs text-muted-foreground">
              BP 344 accessibility checklist will appear after 90 minutes.
            </p>
          </div>
        )}

        {/* Finish button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleFinishClick}
            disabled={completing}
            className="rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 ease-out"
          >
            {completing ? "Saving..." : "Mark as Complete"}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Internal sub-components ──────────────────────────────────

const ProgramTable = ({ program }: { program: Record<string, unknown> }) => {
  const spaces = program.spaces as Array<{
    name: string
    area_sqm?: number
    qty?: number
    slots?: number
    per_floor?: boolean
    floors?: number
    total?: boolean
  }> | undefined

  const totalGfa = program.total_gfa_sqm as number | undefined

  if (!spaces) return <p className="text-xs text-muted-foreground">No program data</p>

  return (
    <div className="flex flex-col gap-0">
      <div className="grid grid-cols-3 gap-x-3 pb-1 border-b border-border">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Space</span>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Area / Qty</span>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Notes</span>
      </div>
      {spaces.map((space, i) => (
        <div key={i} className="grid grid-cols-3 gap-x-3 py-1.5 border-b border-border/60 last:border-0">
          <span className="text-xs text-foreground">{space.name}</span>
          <span className="text-xs text-muted-foreground">
            {space.area_sqm ? `${space.area_sqm} sqm` : space.slots ? `${space.slots} slots` : "—"}
          </span>
          <span className="text-xs text-muted-foreground">
            {space.qty ? `×${space.qty}` : ""}
            {space.per_floor ? " per floor" : ""}
            {space.floors ? `, ${space.floors} floors` : ""}
          </span>
        </div>
      ))}
      {totalGfa && (
        <div className="grid grid-cols-3 gap-x-3 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground">Total GFA</span>
          <span className="text-xs font-semibold text-primary">{totalGfa} sqm</span>
          <span />
        </div>
      )}
    </div>
  )
}

const SiteDataTable = ({ siteData }: { siteData: Record<string, unknown> }) => {
  const setbacks = siteData.setbacks as Record<string, number> | undefined

  const rows: { label: string; value: string }[] = [
    { label: "Lot Area", value: siteData.lot_area_sqm ? `${siteData.lot_area_sqm} sqm` : "—" },
    { label: "Frontage", value: siteData.frontage_m ? `${siteData.frontage_m} m` : "—" },
    { label: "Depth", value: siteData.depth_m ? `${siteData.depth_m} m` : "—" },
    { label: "Max Coverage", value: siteData.max_lot_coverage_pct ? `${siteData.max_lot_coverage_pct}%` : "—" },
    { label: "Max Floors", value: siteData.max_floors ? String(siteData.max_floors) : "—" },
    { label: "Topography", value: siteData.topography ? String(siteData.topography).replace("_", " ") : "—" },
    { label: "Road Facing", value: siteData.road_facing ? String(siteData.road_facing).toUpperCase() : "—" },
    ...(siteData.road_width_m ? [{ label: "Road Width", value: `${siteData.road_width_m} m` }] : []),
    ...(setbacks ? [
      { label: "Setback — Front", value: `${setbacks.front_m} m` },
      { label: "Setback — Rear", value: `${setbacks.rear_m} m` },
      { label: "Setback — Sides", value: `${setbacks.sides_m} m` },
    ] : []),
  ]

  return (
    <div className="flex flex-col gap-0">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-border/60 last:border-0">
          <span className="text-xs text-muted-foreground">{row.label}</span>
          <span className="text-xs font-medium text-foreground">{row.value}</span>
        </div>
      ))}
    </div>
  )
}
