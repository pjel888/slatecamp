import type { ReactNode } from 'react'
import { Target } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { HeaderHero, type HeaderHeroProps } from '@/components/layout/HeaderHero'

export interface PracticeLayoutProps {
  hero: HeaderHeroProps
  children: ReactNode
  fullHeight?: boolean
  contentClassName?: string
}

export function PracticeLayout({ hero, children, fullHeight, contentClassName }: PracticeLayoutProps) {
  return (
    <SharedPageLayout>
      <HeaderHero
        {...hero}
        category={hero.category ?? 'Practice'}
        accent={hero.accent ?? 'emerald'}
        categoryIcon={hero.categoryIcon ?? Target}
      />
      <div
        className={cn(
          fullHeight
            ? 'flex-1 min-h-0 w-full'
            : 'flex-1 min-h-0 w-full max-w-5xl mx-auto px-4 xl:px-6 py-6',
          contentClassName,
        )}
      >
        {children}
      </div>
    </SharedPageLayout>
  )
}

export default PracticeLayout
