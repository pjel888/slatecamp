'use client'

import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'
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
      <LogOut className="h-4 w-4" />
      <span>Sign Out</span>
    </button>
  )
}
