'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ActionTransitionButtonProps
  extends React.ComponentProps<typeof Button> {
  /** Navigate to this URL when clicked. */
  href?: string
  /** Or run this async action when clicked. */
  action?: () => Promise<void>
}

/**
 * Button that wraps programmatic navigation or async actions inside
 * React 19's `useTransition` for immediate loading feedback.
 *
 * Features:
 * - Auto-disables while pending (prevents double-clicks)
 * - Children become invisible, replaced by centered spinner (zero CLS)
 * - Sets `aria-busy` for screen readers
 * - Works with both href-based navigation and async action callbacks
 */
export function ActionTransitionButton({
  href,
  action,
  children,
  className,
  disabled,
  onClick,
  ...props
}: ActionTransitionButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(e as any)
    if (e.defaultPrevented) return

    startTransition(async () => {
      if (action) {
        await action()
      } else if (href) {
        router.push(href)
      }
    })
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending || disabled}
      aria-busy={isPending || undefined}
      className={cn(className, isPending && 'relative')}
      {...props}
    >
      {isPending ? (
        <>
          {/* Invisible children preserve button dimensions — zero CLS */}
          <span className='opacity-0'>{children}</span>
          <span className='absolute inset-0 flex items-center justify-center'>
            <Loader2 className='h-4 w-4 animate-spin' />
          </span>
        </>
      ) : (
        children
      )}
    </Button>
  )
}
