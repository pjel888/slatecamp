import Link from 'next/link'
import type { InProgressSession } from '@/types/dashboard'

const MODE_NAMES: Record<string, string> = {
  camp: 'Camp Mode',
  storm: 'Storm Mode',
  chill: 'Chill Mode',
  timed: 'Timed Quiz',
  practice: 'Practice Quiz',
  custom: 'Custom Quiz',
  blindspot: 'Focus Review',
}

interface ResumeSessionBannerProps {
  session: InProgressSession
}

export function ResumeSessionBanner({ session }: ResumeSessionBannerProps) {
  const remaining = session.totalQuestions - session.currentIndex
  const estimatedMin = Math.max(1, Math.ceil(remaining * 1.2))
  const modeName = MODE_NAMES[session.testMode] ?? 'Quiz'

  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-[#EEF2FC] border border-[#1B3FC4]/10 px-4 py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center justify-center w-6 h-6 rounded bg-[#1B3FC4] text-white text-xs font-bold shrink-0">
          ▶
        </div>
        <div className="min-w-0">
          <span className="text-sm font-medium text-[#1A2332]">
            Resume {modeName}
          </span>
          <span className="text-xs text-[#6B6B6B] ml-2">
            Question {session.currentIndex + 1} of {session.totalQuestions} · ~{estimatedMin} min
          </span>
        </div>
      </div>
      <Link
        href={`/dashboard/testing?session=${session.sessionId}`}
        className="px-4 py-1.5 bg-[#1B3FC4] text-white text-sm font-medium rounded-sm hover:bg-[#1535A8] transition-colors duration-150 shrink-0"
      >
        Continue &rarr;
      </Link>
    </div>
  )
}
