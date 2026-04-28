'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { SignOut } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'

export function LogoutButton() {
  const _router = useRouter()

  async function handleClick() {
    // 1. Clear real Supabase session if it exists (ignoring demo mode)
    // We create a temporary real client just for signout
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { createBrowserClient } = await import('@supabase/ssr')
      const realSupabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      await realSupabase.auth.signOut()
    }

    // 2. Clear simulated sessions if any
    const supabase = createClient()
    await supabase.auth.signOut()

    // 3. Force a hard reload to the landing page
    window.location.href = '/'
  }

  return (
    <Button
      variant="destructive"
      onClick={handleClick}
      className="w-full sm:w-auto"
    >
      <SCIcon icon={SignOut} size="base" className="mr-2" />
      Log out
    </Button>
  )
}
