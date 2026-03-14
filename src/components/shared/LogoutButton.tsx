'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()

  async function handleClick() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <Button
      variant="destructive"
      onClick={handleClick}
      className="w-full sm:w-auto"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Log out
    </Button>
  )
}
