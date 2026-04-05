'use client'

import { List } from '@phosphor-icons/react/dist/ssr'
import { Z_INDEX } from './types'
import { SlateCampLogo } from '@/components/graphics/logos/SlateCampLogo'

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
      <button
        onClick={onOpenDrawer}
        aria-label="Open navigation"
        className="flex items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-camp-cobalt"
        style={{ width: 34, height: 34 }}
      >
        <List size={16} weight="regular" className="w-4 h-4" />
      </button>

      {/* Wordmark logo */}
      <SlateCampLogo size="sm" className="ml-1" />
    </div>
  )
}
