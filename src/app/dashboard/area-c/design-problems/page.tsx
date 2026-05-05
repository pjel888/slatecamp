import { Suspense } from "react"
import { getDesignProblems } from "@/lib/actions/design-problems"
import { DesignProblemCard } from "../_components/DesignProblemCard"
import { PracticeLayout } from "@/components/layouts/category/PracticeLayout"
import { Skeleton } from "@/components/ui/skeleton"

const DesignProblemsContent = async () => {
  const { problems, completedProblemIds, error } = await getDesignProblems()

  if (error) {
    return (
      <div className="rounded-md border border-border bg-card px-4 py-8 text-center">
        <p className="text-sm text-destructive">Unable to load problems. Please try again.</p>
      </div>
    )
  }

  const completedSet = new Set(completedProblemIds)

  // L1 and L2 completed — needed for gating check
  const hasL1 = problems
    .filter((p) => p.difficulty === 1)
    .some((p) => completedSet.has(p.problem_id))
  const hasL2 = problems
    .filter((p) => p.difficulty === 2)
    .some((p) => completedSet.has(p.problem_id))
  const gateUnlocked = hasL1 && hasL2

  return (
    <div className="flex flex-col gap-6">
      {/* Progress summary */}
      {completedProblemIds.length > 0 && (
        <div className="rounded-md border border-border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">
                {completedProblemIds.length} of {problems.length} problems completed
              </span>
              <span className="text-xs font-medium text-primary">
                {Math.round((completedProblemIds.length / problems.length) * 100)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-150 ease-out"
                style={{ width: `${(completedProblemIds.length / problems.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Gating notice */}
      {!gateUnlocked && problems.some((p) => p.difficulty >= 3) && (
        <div className="rounded-sm bg-warning-50 border border-warning/30 px-3 py-2.5">
          <p className="text-xs text-warning">
            Complete a Level 1 and a Level 2 problem to unlock intermediate, advanced, and expert problems.
          </p>
        </div>
      )}

      {/* Problem grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {problems.map((problem) => {
          const isCompleted = completedSet.has(problem.problem_id)
          const isLocked = problem.difficulty >= 3 && !gateUnlocked
          return (
            <DesignProblemCard
              key={problem.problem_id}
              problem={problem}
              isCompleted={isCompleted}
              isLocked={isLocked}
            />
          )
        })}
      </div>
    </div>
  )
}

const DesignProblemsPage = () => (
  <PracticeLayout
    hero={{
      subtitle: 'Design Problem Library',
      description:
        'Practice architectural design within realistic site, program, and code constraints. Problems progress from a single residence to a mixed-use development.',
    }}
  >
    <Suspense
      fallback={
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-md" />
            ))}
          </div>
        </div>
      }
    >
      <DesignProblemsContent />
    </Suspense>
  </PracticeLayout>
)

export default DesignProblemsPage
