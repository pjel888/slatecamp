import type { ReactNode } from 'react'
import { BookOpen } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { HeaderHero, type HeaderHeroProps } from '@/components/layout/HeaderHero'

export interface LearnLayoutProps {
  hero: HeaderHeroProps
  children: ReactNode
  /** When true, removes max-width and padding from the content container. Use for full-height pages like Notes. */
  fullHeight?: boolean
  /** Additional className for the content container. */
  contentClassName?: string
}

export function LearnLayout({ hero, children, fullHeight, contentClassName }: LearnLayoutProps) {
  return (
    <SharedPageLayout>
      <HeaderHero
        {...hero}
        category={hero.category ?? 'Learn'}
        accent={hero.accent ?? 'primary'}
        categoryIcon={hero.categoryIcon ?? BookOpen}
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

export default LearnLayout
