'use client'

import { createClient } from '@/lib/supabase/client'
import { SignOut } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'

export function SignOutButton({ className }: { className?: string }) {
  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <button
      onClick={handleSignOut}
      className={cn(
        "flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors",
        className
      )}
    >
      <SCIcon icon={SignOut} size="sm" />
      <span>Sign Out</span>
    </button>
  )
}
