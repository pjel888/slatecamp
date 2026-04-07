import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Lock } from "@phosphor-icons/react/dist/ssr"
import { getDesignProblem, startDesignSession } from "@/lib/actions/design-problems"
import { getUser } from "@/lib/supabase/server"
import { DesignProblemSession } from "../../_components/DesignProblemSession"
import SharedPageLayout from "@/components/layouts/SharedPageLayout"
import { Skeleton } from "@/components/ui/skeleton"

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Introductory",
  2: "Developing",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
}

type PageProps = {
  params: Promise<{ problemId: string }>
}

const ProblemDetailContent = async ({ problemId }: { problemId: string }) => {
  const { data: { user } } = await getUser()
  if (!user) redirect("/login")

  const { problem, activeSession, isLocked, error } = await getDesignProblem(problemId)

  if (error || !problem) notFound()

  if (isLocked) {
    return (
      <div className="flex flex-col gap-6">
        <BackLink />
        <div className="rounded-md border border-border bg-card p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center">
            <Lock size={18} className="text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{problem.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              This problem is locked. Complete a Level 1 and Level 2 problem first.
            </p>
          </div>
          <Link
            href="/dashboard/area-c/design-problems"
            className="rounded-sm bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary-700 transition-colors duration-150 ease-out"
          >
            Back to Problem Library
          </Link>
        </div>
      </div>
    )
  }

  // Start a session if there isn't one already
  let session = activeSession
  if (!session) {
    const result = await startDesignSession(problemId)
    if (result.error || !result.session_id) {
      return (
        <div className="rounded-md border border-border bg-card px-4 py-8 text-center">
          <p className="text-sm text-destructive">Unable to start session. Please try again.</p>
        </div>
      )
    }
    // Re-fetch to get the full session object
    const refreshed = await getDesignProblem(problemId)
    session = refreshed.activeSession
  }

  if (!session) {
    return (
      <div className="rounded-md border border-[#D4DAE3] bg-card px-4 py-8 text-center">
        <p className="text-sm text-[#D64545]">Session could not be loaded. Please try again.</p>
      </div>
    )
  }

  const difficultyLabel = DIFFICULTY_LABELS[problem.difficulty] ?? "Unknown"
  const hours = Math.floor(problem.time_limit_minutes / 60)
  const mins = problem.time_limit_minutes % 60
  const timeLabel = hours > 0
    ? mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    : `${mins}m`

  return (
    <div className="flex flex-col gap-4">
      <BackLink />

      {/* Problem header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-sm bg-[#F8F7F5] border border-[#D4DAE3] text-[#4A5568]">
            {problem.building_type}
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-sm bg-[#EEF2FC] text-[#1B3FC4]">
            {difficultyLabel}
          </span>
          <span className="text-[10px] text-[#8896A7]">Goal: {timeLabel}</span>
        </div>
        <h1 className="text-lg font-semibold text-[#1A2332]">{problem.title}</h1>
      </div>

      <DesignProblemSession problem={problem} session={session} />
    </div>
  )
}

const BackLink = () => (
  <Link
    href="/dashboard/area-c/design-problems"
    className="flex items-center gap-1.5 text-xs text-[#4A5568] hover:text-[#1A2332] transition-colors duration-150 ease-out w-fit"
  >
    <ArrowLeft size={14} />
    Design Problem Library
  </Link>
)

const ProblemDetailPage = async ({ params }: PageProps) => {
  const { problemId } = await params

  return (
    <SharedPageLayout>
      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-48 w-full rounded-md" />
          </div>
        }
      >
        <ProblemDetailContent problemId={problemId} />
      </Suspense>
    </SharedPageLayout>
  )
}

export default ProblemDetailPage
