import Link from 'next/link'
import type { SubjectFloorAlert as SubjectFloorAlertType } from '@/types/dashboard'

interface SubjectFloorAlertProps {
  alerts: SubjectFloorAlertType[]
}

export const SubjectFloorAlert = ({ alerts }: SubjectFloorAlertProps) => {
  if (alerts.length === 0) return null

  return (
    <div className="rounded-md bg-camp-red shadow-none">
      {alerts.map((alert, index) => (
        <div key={alert.subject}>
          {index > 0 && (
            <div className="border-t border-white/20" />
          )}
          <div className="px-4 py-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-white">
              EXAM RISK: SUBJECT FLOOR
            </p>
            <p className="mt-1 text-sm leading-snug text-white">
              {alert.subject} is at {alert.mastery}%. The ALE requires at least{' '}
              {alert.floorPct}% in every subject to pass — regardless of your overall score.
            </p>
            <Link
              href={`/dashboard/drills?subject=${alert.aleId ?? ''}`}
              className="mt-2 inline-block rounded-sm bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-700"
            >
              Study {alert.subject} Now →
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
