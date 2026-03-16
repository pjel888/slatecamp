import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const PredictiveRemediationCTA = () => {
  return (
    <Card className='border-zinc-200 bg-zinc-50 shadow-none'>
      <CardContent className='flex flex-col  gap-3 py-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-1'>
          <p className='text-sm font-medium tracking-tight text-zinc-900'>
            Predictive remediation
          </p>
          <p className='max-w-xl text-xs text-zinc-500'>
            Generate a targeted quiz built from your red and grey nodes only, so
            every item repairs a real gap.
          </p>
        </div>
        <Button className='mt-1 h-9 rounded-full bg-blue-600 px-4 text-xs font-medium text-white shadow-sm hover:bg-blue-700'>
          Generate 30-item target quiz
        </Button>
      </CardContent>
    </Card>
  )
}
