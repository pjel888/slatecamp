'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogoutButton } from '@/components/shared/LogoutButton'

export function LogoutCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Account</CardTitle>
        <p className='text-xs text-muted-foreground'>
          Sign out of your account on this device.
        </p>
      </CardHeader>
      <CardContent>
        <LogoutButton />
      </CardContent>
    </Card>
  )
}
