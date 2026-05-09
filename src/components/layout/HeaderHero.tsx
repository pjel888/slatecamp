import type { ReactNode } from 'react'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export type HeaderHeroAccent = 'primary' | 'camp-orange' | 'emerald' | 'warning'

const accentBorderMap: Record<HeaderHeroAccent, string> = {
  primary: 'border-l-primary',
  'camp-orange': 'border-l-camp-orange',
  emerald: 'border-l-emerald',
  warning: 'border-l-warning',
}

const accentTextMap: Record<HeaderHeroAccent, string> = {
  primary: 'text-primary',
  'camp-orange': 'text-camp-orange',
  emerald: 'text-emerald',
  warning: 'text-warning',
}

export interface HeaderHeroProps {
  title?: string
  subtitle?: string
  category?: string
  description?: string
  actions?: ReactNode
  metadata?: ReactNode
  backgroundImage?: string
  backgroundOverlay?: string
  accent?: HeaderHeroAccent
  categoryIcon?: PhosphorIcon
  children?: ReactNode
  className?: string
}

export function HeaderHero({
  category,
  description,
  actions,
  metadata,
  backgroundImage,
  backgroundOverlay,
  accent,
  categoryIcon: CategoryIcon,
  children,
  className,
}: HeaderHeroProps) {
  const accentBorder = accent ? accentBorderMap[accent] : undefined
  const accentText = accent ? accentTextMap[accent] : 'text-primary'

  return (
    <section
      className={cn(
        'relative mb-1 w-full h-8 flex items-center border border-border bg-card overflow-hidden',
        accentBorder && `border-l-[3px] ${accentBorder}`,
        className,
      )}
    >
      {backgroundImage && (
        <div
          className='absolute inset-0 bg-cover bg-center'
          style={{ backgroundImage: `url(${backgroundImage})` }}
          aria-hidden='true'
        />
      )}
      {backgroundOverlay && (
        <div
          className={cn('absolute inset-0', backgroundOverlay)}
          aria-hidden='true'
        />
      )}
      <div className='relative z-10 w-full max-w-5xl px-4 xl:px-6'>
        <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-3'>
          <div className='flex-1 min-w-0 space-y-1'>
            {/* {category && (
              <p
                className={cn(
                  'font-dm-mono text-[11px] font-medium uppercase tracking-[0.15em] flex items-center gap-1.5',
                  accentText,
                )}
              >
                {CategoryIcon && (
                  <CategoryIcon size={14} weight='fill' aria-hidden='true' />
                )}
                {category}
              </p>
            )} */}
            {description && (
              <p className='text-sm text-text-secondary leading-tight'>
                {description}
              </p>
            )}
            {metadata && <div className='pt-1'>{metadata}</div>}
          </div>
          {actions && (
            <div className='flex items-center gap-2 shrink-0'>{actions}</div>
          )}
        </div>
        {children && <div className='mt-3'>{children}</div>}
      </div>
    </section>
  )
}

export default HeaderHero
