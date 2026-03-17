import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const PredictiveRemediationCTA = () => {
  return (
    <Card className='border-zinc-200 bg-zinc-50 shadow-none'>
      <CardContent className='flex flex-col  gap-3 py-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-1'>
          <p className='text-sm font-medium tracking-tight text-zinc-900'>
            Suggested practice session
          </p>
          <p className='max-w-xl text-xs text-zinc-500'>
            A 30-question session focused on the topics where practice will make
            the biggest difference — built just for you.
          </p>
        </div>
        <Button className='mt-1 h-9 rounded-sm bg-primary px-4 text-xs font-medium text-white shadow-sm hover:bg-[#2F5A85]'>
          Start 30-Question Session
        </Button>
      </CardContent>
    </Card>
  )
}
