import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants/routes'

export const PersonalWorkspaceLink = () => {
  return (
    <Card className='border-0 bg-zinc-50 shadow-none'>
      <CardContent className='flex flex-col items-start justify-between gap-3 py-3 sm:flex-row sm:items-center'>
        <div className='space-y-1'>
          <p className='text-sm font-medium tracking-tight text-zinc-900'>
            Personal workspace
          </p>
          <p className='max-w-md text-xs text-zinc-500'>
            Your synthesis ledger for cheat sheets, 3D snapshots, and flashcards.
            Everything you have consolidated in camp lives here.
          </p>
        </div>
        <Link
          href={ROUTES.NOTES}
          className='text-xs font-medium tracking-tight text-primary underline-offset-2 hover:underline'
        >
          Open workspace
        </Link>
      </CardContent>
    </Card>
  )
}

