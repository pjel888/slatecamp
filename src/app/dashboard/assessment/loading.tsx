import { Skeleton } from '@/components/ui/skeleton'

export default function AssessmentLoading() {
  return (
    <div className="w-full h-full bg-[#F5F7FA] flex items-center justify-center animate-in fade-in-0 duration-150">
      <div className="w-full max-w-xl space-y-6 text-center px-6">
        {/* Progress bar */}
        <Skeleton className="h-1.5 w-full rounded-full" />

        {/* Question card */}
        <div className="rounded-md border border-[border] bg-white p-8 space-y-5">
          <Skeleton className="h-3 w-20 mx-auto" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-5/6 mx-auto" />

          {/* Answer options */}
          <div className="space-y-2.5 pt-2">
            {['A', 'B', 'C', 'D'].map((letter) => (
              <div key={letter} className="flex items-center gap-3 rounded-sm border border-[border] p-3">
                <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
