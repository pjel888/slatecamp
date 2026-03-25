'use client'

import { Cube } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'

interface ThreeDCanvasPlaceholderProps {
  label?: string
  results?: { label: string; value: string }[]
}

export const ThreeDCanvasPlaceholder = ({
  label = '3D Preview',
  results,
}: ThreeDCanvasPlaceholderProps) => {
  return (
    <div
      className={cn(
        'relative w-full min-h-[300px] lg:min-h-[400px] rounded-md border border-border overflow-hidden',
        'bg-[#F5F7FA] dark:bg-zinc-900',
      )}
      style={{
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 23px,
            color-mix(in srgb, #1B3FC4 8%, transparent) 23px,
            color-mix(in srgb, #1B3FC4 8%, transparent) 24px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 23px,
            color-mix(in srgb, #1B3FC4 8%, transparent) 23px,
            color-mix(in srgb, #1B3FC4 8%, transparent) 24px
          )
        `,
      }}
    >
      {/* Center content */}
      <div className='absolute inset-0 flex flex-col items-center justify-center gap-3'>
        {/* Pulsing dot */}
        <span
          className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-2 rounded-full bg-primary/30 motion-safe:animate-ping'
          aria-hidden='true'
        />

        <Cube
          weight='thin'
          size={40}
          className='text-primary/40 dark:text-primary/30 relative z-10'
        />
        <span className='font-dm-mono text-[13px] text-muted-foreground relative z-10'>
          {label}
        </span>
      </div>

      {/* Results overlay */}
      {results && results.length > 0 && (
        <div className='absolute bottom-0 inset-x-0 bg-card/90 backdrop-blur-sm border-t border-border p-4'>
          <dl className='grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3'>
            {results.map(({ label: resultLabel, value }) => (
              <div key={resultLabel} className='flex flex-col gap-0.5'>
                <dt className='text-[11px] text-muted-foreground leading-tight'>
                  {resultLabel}
                </dt>
                <dd className='font-dm-mono text-[13px] font-medium text-foreground'>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}
