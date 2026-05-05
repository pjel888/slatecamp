'use client'

import { cn } from '@/lib/utils'
import { SlateCampLogomark } from '@/components/graphics/logos/SlateCampLogomark'
import { CaretDoubleRight, Crown } from '@phosphor-icons/react/dist/ssr'
import { SIDEBAR_PADDING, SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_EXPANDED } from './types'

// ---------------------------------------------------------------------------
// SidebarHeader — responsive image mask
// Expanded uses a square image mask. Collapsed keeps the rail padded but turns
// the same image surface into a vertical rectangle, not a small square thumbnail.
// ---------------------------------------------------------------------------

interface SidebarHeaderProps {
  expanded: boolean
  tier: string
  onToggle: () => void
  toggleRef: React.RefObject<HTMLButtonElement | null>
}

const BRAND_FRAME_INSET = SIDEBAR_PADDING
const EXPANDED_FRAME_SIZE = SIDEBAR_WIDTH_EXPANDED - BRAND_FRAME_INSET * 2
const COLLAPSED_FRAME_WIDTH = SIDEBAR_WIDTH_COLLAPSED - BRAND_FRAME_INSET * 2
const COLLAPSED_FRAME_HEIGHT = EXPANDED_FRAME_SIZE
const HEADER_HEIGHT = SIDEBAR_WIDTH_EXPANDED

const formatTierLabel = (tier: string) => {
  const normalized = tier.trim()
  if (!normalized) return 'Free plan'
  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)} plan`
}

export const SidebarHeader = ({ expanded, tier, onToggle, toggleRef }: SidebarHeaderProps) => {
  const frameWidth = expanded ? EXPANDED_FRAME_SIZE : COLLAPSED_FRAME_WIDTH
  const frameHeight = expanded ? EXPANDED_FRAME_SIZE : COLLAPSED_FRAME_HEIGHT
  const tierLabel = formatTierLabel(tier)

  return (
    <div
      className="shrink-0 overflow-hidden border-b border-border bg-white transition-[height] duration-[180ms] ease-out motion-reduce:transition-none"
      style={{ height: HEADER_HEIGHT }}
    >
      <div className="p-2">
        <div
          className={cn(
            'relative overflow-hidden rounded-md bg-camp-cobalt text-white ring-1 ring-camp-cobalt/10',
            'transition-[width,height] duration-[180ms] ease-out motion-reduce:transition-none',
          )}
          style={{
            width: frameWidth,
            height: frameHeight,
            backgroundImage: 'url("/sidebar-image.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-linear-to-b from-camp-cobalt/20 via-camp-cobalt/8 to-camp-cobalt/45" />

          <div className="relative flex h-full flex-col justify-between p-2">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2 border-b border-white/70 pb-2">
                <div
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-sm text-white',
                    'transition-[background-color,box-shadow,backdrop-filter] duration-[180ms] ease-out motion-reduce:transition-none',
                    expanded
                      ? 'bg-transparent ring-0 backdrop-blur-none'
                      : 'bg-white/16 ring-1 ring-white/24 backdrop-blur-[1px]',
                  )}
                >
                  <SlateCampLogomark size={22} className="text-white" />
                </div>

                <div
                  className={cn(
                    'min-w-0 whitespace-nowrap overflow-hidden',
                    'text-[15px] font-bold leading-none font-[family-name:var(--font-sora)] tracking-[-0.01em] text-white drop-shadow-sm',
                    'transition-[opacity,transform] duration-[180ms] ease-out motion-reduce:transition-none motion-reduce:transform-none',
                    expanded ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-1 opacity-0',
                  )}
                >
                  SlateCamp
                </div>
              </div>

              <div
                className={cn(
                  'flex h-9 items-center overflow-hidden',
                  expanded ? 'justify-start px-1' : 'justify-center px-0',
                )}
              >
                <div
                  className={cn(
                    'inline-flex min-w-0 items-center rounded-sm text-white/82 backdrop-blur-[1px]',
                    'ring-1 ring-white/16 bg-white/[0.08]',
                    'transition-[width,padding,opacity] duration-[180ms] ease-out motion-reduce:transition-none',
                    expanded ? 'h-6 max-w-full gap-1.5 px-2 opacity-90' : 'size-8 justify-center px-0 opacity-85',
                  )}
                  aria-label={tierLabel}
                  title={tierLabel}
                >
                  <Crown size={expanded ? 12 : 15} weight="regular" className="shrink-0 text-white/78" />
                  {expanded && (
                    <span className="min-w-0 truncate whitespace-nowrap text-[10px] font-medium leading-none tracking-[0.03em] text-white/78">
                      {tierLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={cn('flex', expanded ? 'justify-end' : 'justify-center')}>
              <button
                ref={toggleRef}
                onClick={onToggle}
                aria-expanded={expanded}
                aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
                className={cn(
                  'inline-flex h-8 items-center justify-center rounded-sm text-white/78',
                  'bg-white/[0.10] ring-1 ring-white/16 backdrop-blur-[1px]',
                  'transition-[width,background-color,color] duration-[180ms] ease-out motion-reduce:transition-none',
                  'outline-none hover:bg-white/[0.16] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/75',
                  expanded ? 'w-8' : 'w-8',
                )}
              >
                <CaretDoubleRight
                  size={16}
                  weight="regular"
                  className={cn(
                    'shrink-0 transition-transform duration-[180ms] ease-out',
                    expanded && 'rotate-180',
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
