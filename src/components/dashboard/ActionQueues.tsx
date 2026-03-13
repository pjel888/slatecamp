import { Shield, Target, Timer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ActionQueuesProps {
  proofUnlocked: boolean
}

export const ActionQueues = ({ proofUnlocked }: ActionQueuesProps) => {
  return (
    <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
      <Card className='border-zinc-200 bg-white shadow-none'>
        <CardHeader className='flex flex-row items-start justify-between gap-2 pb-1.5'>
          <CardTitle className='text-xs font-medium tracking-tight text-zinc-900'>
            Blindspot Protocol
          </CardTitle>
          <Target className='h-4 w-4 text-zinc-500' strokeWidth={1.5} />
        </CardHeader>
        <CardContent className='space-y-2 pt-0.5'>
          <p className='text-[11px] leading-snug text-zinc-500'>
            10–15 items focused only on your weakest syllabus nodes.
          </p>
          <p className='text-[11px] text-zinc-600'>
            Regenerates nightly from your heatmap.
          </p>
          <Button
            variant='ghost'
            size='sm'
            className='mt-1 h-7 px-2 text-[11px] font-medium text-zinc-900'
          >
            Start blindspot quiz
          </Button>
        </CardContent>
      </Card>

      <Card className='border-zinc-200 bg-white shadow-none'>
        <CardHeader className='flex flex-row items-start justify-between gap-2 pb-1.5'>
          <CardTitle className='text-xs font-medium tracking-tight text-zinc-900'>
            Endurance Cycle
          </CardTitle>
          <Timer className='h-4 w-4 text-zinc-500' strokeWidth={1.5} />
        </CardHeader>
        <CardContent className='space-y-2 pt-0.5'>
          <p className='text-[11px] leading-snug text-zinc-500'>
            Weekly extended Camp / Storm mix slightly beyond your current window.
          </p>
          <p className='text-[11px] text-zinc-600'>
            Calibrated to push 10–15% past your stable focus time.
          </p>
          <Button
            variant='ghost'
            size='sm'
            className='mt-1 h-7 px-2 text-[11px] font-medium text-zinc-900'
          >
            Schedule cycle
          </Button>
        </CardContent>
      </Card>

      <Card
        className={cn(
          'border-zinc-200 bg-white shadow-none',
          !proofUnlocked && 'opacity-50 grayscale',
        )}
      >
        <CardHeader className='flex flex-row items-start justify-between gap-2 pb-1.5'>
          <CardTitle className='text-xs font-medium tracking-tight text-zinc-900'>
            Proof Simulation
          </CardTitle>
          <Shield className='h-4 w-4 text-zinc-500' strokeWidth={1.5} />
        </CardHeader>
        <CardContent className='space-y-2 pt-0.5'>
          <p className='text-[11px] leading-snug text-zinc-500'>
            Full-fidelity exam rehearsal mirroring timing, structure, and pressure.
          </p>
          <p className='text-[11px] text-zinc-600'>
            Unlocks once ≥70% of nodes are Amber+ and endurance covers ≥80% of exam
            time.
          </p>
          <Button
            variant='ghost'
            size='sm'
            disabled={!proofUnlocked}
            className='mt-1 h-7 px-2 text-[11px] font-medium text-zinc-900'
          >
            {proofUnlocked ? 'Launch simulation' : 'Locked until ready'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

