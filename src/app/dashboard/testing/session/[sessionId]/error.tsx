'use client'

import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

const SessionError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  const router = useRouter()

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F5F7FA] px-6 text-center">
      <div className="max-w-sm space-y-4">
        <h2 className="text-lg font-semibold text-[#1A2332]">Session Error</h2>
        <p className="text-sm text-[#4A5568]">
          {error.message || 'Something went wrong loading this session.'}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="h-9 px-5 rounded-sm border border-[#D4DAE3] text-[#4A5568] text-[11px] font-black uppercase tracking-widest hover:bg-[#EEF2FC]/50 transition-colors"
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={() => router.push(ROUTES.TESTING)}
            className="h-9 px-5 rounded-sm bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#1535A8] transition-colors"
          >
            Back to Testing
          </button>
        </div>
      </div>
    </div>
  )
}

export default SessionError
