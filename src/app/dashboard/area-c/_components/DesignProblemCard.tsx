"use client"

import Link from "next/link"
import { Lock, CheckCircle, Clock } from "@phosphor-icons/react"
import type { DesignProblem } from "@/lib/actions/design-problems"

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Introductory",
  2: "Developing",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
}

const DIFFICULTY_COLORS: Record<number, string> = {
  1: "text-[#2D9F6F] bg-[#EDFAF4]",
  2: "text-[#3B82C8] bg-[#EEF2FC]",
  3: "text-[#D4951A] bg-[#FEF8ED]",
  4: "text-[#E8853A] bg-[#FEF8ED]",
  5: "text-[#D64545] bg-[#FDF0F0]",
}

type DesignProblemCardProps = {
  problem: DesignProblem
  isCompleted: boolean
  isLocked: boolean
}

const DifficultyDots = ({ level }: { level: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className={`w-1.5 h-1.5 rounded-full ${i < level ? "bg-[#1B3FC4]" : "bg-[#D4DAE3]"}`}
      />
    ))}
  </div>
)

export const DesignProblemCard = ({ problem, isCompleted, isLocked }: DesignProblemCardProps) => {
  const difficultyLabel = DIFFICULTY_LABELS[problem.difficulty] ?? "Unknown"
  const difficultyColor = DIFFICULTY_COLORS[problem.difficulty] ?? "text-[#4A5568] bg-[#F8F7F5]"
  const hours = Math.floor(problem.time_limit_minutes / 60)
  const mins = problem.time_limit_minutes % 60
  const timeLabel = hours > 0
    ? mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    : `${mins}m`

  const href = `/dashboard/area-c/design-problems/${problem.problem_id}`

  const cardContent = (
    <div
      className={`
        rounded-md border bg-white p-4 flex flex-col gap-3
        transition-shadow duration-150 ease-out
        ${isLocked
          ? "border-[#D4DAE3] opacity-60 cursor-not-allowed"
          : "border-[#D4DAE3] hover:shadow-sm cursor-pointer"
        }
      `}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#8896A7] mb-1">{problem.building_type}</p>
          <h3 className="text-sm font-semibold text-[#1A2332] leading-snug">{problem.title}</h3>
        </div>

        {isLocked ? (
          <div className="shrink-0 text-[#8896A7] mt-0.5">
            <Lock size={16} weight="bold" />
          </div>
        ) : isCompleted ? (
          <div className="shrink-0 text-[#2D9F6F] mt-0.5">
            <CheckCircle size={16} weight="fill" />
          </div>
        ) : null}
      </div>

      {/* Brief excerpt */}
      <p className="text-xs text-[#4A5568] leading-relaxed line-clamp-2">
        {problem.brief}
      </p>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-sm ${difficultyColor}`}>
          {difficultyLabel}
        </span>

        <div className="flex items-center gap-3">
          <DifficultyDots level={problem.difficulty} />
          <div className="flex items-center gap-1 text-[#8896A7]">
            <Clock size={12} />
            <span className="text-[10px]">{timeLabel} goal</span>
          </div>
        </div>
      </div>

      {/* Locked notice */}
      {isLocked && (
        <p className="text-[10px] text-[#8896A7] border-t border-[#D4DAE3] pt-2 mt-0">
          Complete Level 1 and Level 2 problems to unlock
        </p>
      )}
    </div>
  )

  if (isLocked) return <div>{cardContent}</div>

  return <Link href={href}>{cardContent}</Link>
}
