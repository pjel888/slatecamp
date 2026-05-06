'use client'

import { List } from '@phosphor-icons/react/dist/ssr'
import { Z_INDEX } from './types'
import { SlateCampLogo } from '@/components/graphics/logos/SlateCampLogo'
import { Button } from '@/components/ui/button'

// ---------------------------------------------------------------------------
// MobileTopBar — fixed 42px bar visible only below lg breakpoint
// Spec: HTML v4. z-index 45. Hamburger opens MobileDrawer via onOpenDrawer.
// ---------------------------------------------------------------------------

interface MobileTopBarProps {
  onOpenDrawer: () => void
}

export const MobileTopBar = ({ onOpenDrawer }: MobileTopBarProps) => {
  return (
    <div
      className="flex lg:hidden items-center px-2 gap-2"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 42,
        zIndex: Z_INDEX.mobileTopBar,
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'white',
      }}
    >
      {/* Hamburger button */}
      <Button
        onClick={onOpenDrawer}
        aria-label="Open navigation"
        variant="ghost"
        size="icon"
        className="size-[34px] text-text-secondary hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        <List size={16} weight="regular" className="w-4 h-4" />
      </Button>

      {/* Wordmark logo */}
      <SlateCampLogo size="sm" className="ml-1" />
    </div>
  )
}
