'use client'

import { GoogleIcon } from '@/components/auth/GoogleIcon'
import { cn } from '@/lib/utils'

interface SignInWithGoogleButtonProps {
  onClick: () => void
  disabled?: boolean
  isLoading?: boolean
  loadingLabel?: string
  className?: string
}

export function SignInWithGoogleButton({
  onClick,
  disabled = false,
  isLoading = false,
  loadingLabel = 'Redirecting to Google…',
  className,
}: SignInWithGoogleButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={cn(
        'flex min-h-[44px] w-full items-center justify-center gap-3 rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 transition-colors duration-150',
        'hover:bg-gray-50 hover:border-zinc-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
    >
      <GoogleIcon className='size-5 shrink-0' />
      <span>{isLoading ? loadingLabel : 'Sign in with Google'}</span>
    </button>
  )
}
