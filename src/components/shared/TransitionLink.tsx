'use client'

import { useTransition, type ComponentProps } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CircleNotch } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'

interface TransitionLinkProps extends ComponentProps<typeof Link> {
  /**
   * Called before navigation starts. Call `e.preventDefault()` to cancel
   * the transition — e.g., to show a "leave session?" confirmation dialog.
   */
  onBeforeNavigate?: (e: React.MouseEvent<HTMLAnchorElement>) => void

  /**
   * When true, shows a centered spinner overlay while the route transition
   * is in progress. Children become invisible (opacity-0) to preserve their
   * exact layout dimensions — zero Cumulative Layout Shift (CLS).
   *
   * Use for CTA-style links. Nav links should leave this false and rely
   * on the global progress bar + opacity dim.
   */
  showSpinner?: boolean
}

/**
 * Drop-in replacement for next/link that wraps navigation inside
 * React 19's `useTransition`, providing immediate `isPending` feedback.
 *
 * Features:
 * - Keeps <Link> for SEO (<a> tag) and automatic prefetching on hover
 * - Sets `data-pending`, `aria-disabled`, `aria-busy` when transitioning
 * - Dims link while loading (pointer-events-none + opacity-60)
 * - Optionally overlays a centered spinner (showSpinner) for CTAs
 * - Respects modifier keys (cmd+click opens new tab normally)
 * - Supports onBeforeNavigate for cancel-able navigation
 */
export function TransitionLink({
  onBeforeNavigate,
  showSpinner = false,
  children,
  href,
  onClick,
  className,
  ...props
}: TransitionLinkProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // 1. Fire any existing onClick handler (e.g., analytics tracking)
    onClick?.(e)
    if (e.defaultPrevented) return

    // 2. Allow cancellation via onBeforeNavigate (active session guard)
    onBeforeNavigate?.(e)
    if (e.defaultPrevented) return

    // 3. Don't intercept modifier clicks (new tab, new window, etc.)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (props.target === '_blank') return

    // 4. Prevent default Link navigation — we'll handle it via router
    e.preventDefault()

    // 5. Navigate inside a transition for isPending state
    const url = typeof href === 'string' ? href : (href.pathname ?? '/')
    startTransition(() => {
      router.push(url)
    })
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      data-pending={isPending || undefined}
      aria-disabled={isPending || undefined}
      aria-busy={isPending || undefined}
      className={cn(
        className,
        isPending && !showSpinner && 'pointer-events-none opacity-60',
        isPending && showSpinner && 'pointer-events-none relative',
      )}
      {...props}
    >
      {isPending && showSpinner ? (
        <>
          {/* Children stay in flow at opacity-0 — preserves exact layout (zero CLS) */}
          <span className='opacity-0'>{children}</span>
          {/* Spinner centered over the preserved layout space */}
          <span className='absolute inset-0 flex items-center justify-center'>
            <SCIcon icon={CircleNotch} size='sm' className='animate-spin' />
          </span>
        </>
      ) : (
        children
      )}
    </Link>
  )
}
