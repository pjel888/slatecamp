import { cn } from '@/lib/utils'

interface QuestionStemProps {
  text: string
  imageUrl?: string | null
  className?: string
}

export function QuestionStem({ text, imageUrl, className }: QuestionStemProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {imageUrl && (
        <div className="rounded-sm overflow-hidden border border-zinc-200 bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Question reference material"
            className="w-full max-h-[240px] object-contain"
          />
        </div>
      )}
      <p
        className="text-[18px] text-zinc-900 leading-[1.65] tracking-tight max-w-[65ch]"
        style={{ fontWeight: 450 }}
      >
        {text}
      </p>
    </div>
  )
}
