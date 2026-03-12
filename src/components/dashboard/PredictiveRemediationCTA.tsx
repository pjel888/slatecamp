import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const PredictiveRemediationCTA = () => {
  return (
    <Card className='border-slatecamp-border bg-slatecamp-paper-cool/60 shadow-none'>
      <CardContent className='flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-1'>
          <p className='text-sm font-medium tracking-tight text-slatecamp-ink-main'>
            Predictive remediation
          </p>
          <p className='max-w-xl text-xs text-slatecamp-ink-subtle'>
            Generate a targeted quiz built from your red and grey nodes only, so
            every item repairs a real gap.
          </p>
        </div>
        <Button className='mt-1 h-9 rounded-full bg-slatecamp-amber px-4 text-xs font-medium text-slatecamp-paper-snow shadow-sm hover:bg-slatecamp-amber-hover'>
          Generate 30-item target quiz
        </Button>
      </CardContent>
    </Card>
  )
}

