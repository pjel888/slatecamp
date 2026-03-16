'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Calendar,
  Flame,
  Timer,
  TrendingUp,
  CheckCircle2,
  Clock,
  StickyNote,
  Flag,
  AlertCircle,
  Zap,
  Box,
  Target,
  Info,
  BookOpen,
} from 'lucide-react'
import {
  ResponsiveContainer,
  YAxis,
  XAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  ReferenceLine,
  Line,
  Legend,
  ComposedChart,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { RichInfoPopover } from './RichInfoPopover'

// --- Mock Data ---

const MOCK_WEEKLY_DATA = [
  { week: 'W1', score: 62, peerAverage: 60 },
  { week: 'W2', score: 65, peerAverage: 61 },
  { week: 'W3', score: 64, peerAverage: 62 },
  { week: 'W4', score: 68, peerAverage: 63 },
  { week: 'W5', score: 70, peerAverage: 64 },
  { week: 'W6', score: 69, peerAverage: 65 },
  { week: 'W7', score: 74, peerAverage: 66 },
  { week: 'W8', score: 76, peerAverage: 67 },
]

const MOCK_RECENT_ACTIVITY = [
  {
    id: 1,
    time: '10:42 AM',
    title: 'Completed 25-item Quiz',
    detail: 'Architectural Practice (76%)',
    icon: CheckCircle2,
  },
  {
    id: 2,
    time: '9:15 AM',
    title: 'Read Wiki: PD 1096',
    detail: 'National Building Code',
    icon: StickyNote,
  },
  {
    id: 3,
    time: 'Yesterday',
    title: 'Saved 3 Notes',
    detail: 'Structural Design - Lateral Loads',
    icon: StickyNote,
  },
  {
    id: 4,
    time: 'Yesterday',
    title: 'Flagged 4 High-Yield Items',
    detail: 'Professional Practice Ethics',
    icon: Flag,
  },
  {
    id: 5,
    time: '2 days ago',
    title: '3D Lab: Structural Joint',
    detail: '15m Interactive Session',
    icon: Box,
  },
  {
    id: 6,
    time: '3 days ago',
    title: 'Completed 10-item Storm',
    detail: 'Building Utilities (92%)',
    icon: Zap,
  },
  {
    id: 7,
    time: '4 days ago',
    title: 'Read Wiki: Rule 7 & 8',
    detail: 'Setbacks and Incremental',
    icon: StickyNote,
  },
]

// --- Sub-components ---

const ICON_MAP = {
  timer: Timer,
  calendar: Calendar,
  flame: Flame,
  alert: AlertCircle,
  clock: Clock,
  zap: Zap,
  book: BookOpen,
}

const COPY_MAP = {
  timer: {
    title: 'Latency Analytics',
    desc: 'Tracks average time spent per question against the exam standard.',
  },
  calendar: {
    title: 'Exam Countdown',
    desc: 'Temporal proximity tracking for the upcoming examination.',
  },
  flame: {
    title: 'System Engagement',
    desc: 'Chronological record of system interactions and study consistency.',
  },
  book: {
    title: 'Spaced Repetition Queue',
    desc: 'Items scheduled for review based on a modified SM-2 algorithm.',
  },
  alert: {
    title: 'Blindspot Protocol',
    desc: 'Automated targeting of your weakest or avoided taxonomy nodes.',
  },
  clock: {
    title: 'Endurance Cycle',
    desc: 'Progressive cognitive stamina training extending weekly by 10-15%.',
  },
  zap: {
    title: 'Proof Simulation',
    desc: 'Full-fidelity exam rehearsal. Diagnostics locked for 24h.',
  },
}

export const MetricSmall = ({
  iconName,
  label,
  val,
  unit,
  color = 'zinc',
}: {
  iconName: keyof typeof ICON_MAP
  label: string
  val: string
  unit: string
  color?: string
}) => {
  const Icon = ICON_MAP[iconName]
  const copy = COPY_MAP[iconName as keyof typeof COPY_MAP]

  return (
    <Card className='rounded-sm border-zinc-200 bg-white shadow-none p-2 relative'>
      <RichInfoPopover title={copy.title} description={copy.desc} />
      <div className='flex items-center gap-2'>
        <div
          className={cn(
            'p-1.5 rounded-sm bg-zinc-50',
            color === 'orange' && 'bg-orange-50',
            color === 'amber' && 'bg-amber-50',
          )}
        >
          <Icon
            className={cn(
              'h-3.5 w-3.5 text-zinc-400',
              color === 'orange' && 'text-orange-500',
              color === 'amber' && 'text-amber-600',
            )}
          />
        </div>
        <div>
          <p className='text-[9px] font-bold text-zinc-400 uppercase tracking-wider leading-none'>
            {label}
          </p>
          <div className='flex items-baseline gap-1 mt-0.5'>
            <span className='text-lg font-bold text-zinc-900 leading-none'>
              {val}
            </span>
            <span className='text-[9px] font-medium text-zinc-500 uppercase tracking-tight'>
              {unit}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export const ActionTall = ({
  iconName,
  title,
  detail,
  color = 'blue',
}: {
  iconName: keyof typeof ICON_MAP
  title: string
  detail: string
  color?: string
}) => {
  const Icon = ICON_MAP[iconName]
  const copy = COPY_MAP[iconName as keyof typeof COPY_MAP]

  return (
    <Card className='rounded-sm border-zinc-200 bg-white shadow-none p-2 flex flex-col justify-between hover:border-blue-200 hover:bg-blue-50/20 transition-all cursor-pointer group flex-1 relative'>
      <RichInfoPopover title={copy.title} description={copy.desc} />
      <div>
        <div className='p-1.5 rounded-sm bg-zinc-50 group-hover:bg-blue-50 w-fit'>
          <Icon className='h-4 w-4 text-zinc-400 group-hover:text-blue-600' />
        </div>
        <h4 className='text-[12px] font-bold text-zinc-900 mt-2 leading-tight'>
          {title}
        </h4>
        <p className='text-[10px] text-zinc-500 mt-1 leading-snug'>{detail}</p>
      </div>
      <Button
        variant='ghost'
        className='p-0 h-auto text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-3 justify-start hover:bg-transparent'
      >
        Initialize →
      </Button>
    </Card>
  )
}

export const UnifiedReadinessCard = ({
  score,
  previousScore,
}: {
  score: number
  previousScore: number | null
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  const trend =
    !previousScore || score === previousScore
      ? 'flat'
      : score > previousScore
        ? 'up'
        : 'down'

  return (
    <Card className='rounded-sm border-zinc-200 bg-white shadow-none overflow-hidden flex flex-col p-2 relative'>
      <RichInfoPopover
        title='Readiness Score Calculation'
        description='A composite metric combining EMA and IRT. Recent performance is weighted heavier.'
      />
      <CardHeader className='p-2 pt-1'>
        <div className='flex justify-between items-start'>
          <div>
            <CardTitle className='text-[10px] font-bold tracking-wider text-zinc-500 uppercase'>
              Current Readiness
            </CardTitle>
            <div className='flex items-baseline gap-1 mt-0.5'>
              <span
                className={cn(
                  'text-4xl font-bold tracking-tighter',
                  clamped < 50
                    ? 'text-red-600'
                    : clamped <= 80
                      ? 'text-amber-600'
                      : 'text-green-600',
                )}
              >
                {clamped}%
              </span>
              <div
                className={cn(
                  'flex items-center gap-1 px-1 py-0.5 rounded-full text-[9px] font-bold uppercase',
                  trend === 'up' && 'bg-green-50 text-green-700',
                  trend === 'down' && 'bg-red-50 text-red-700',
                  trend === 'flat' && 'bg-zinc-50 text-zinc-500',
                )}
              >
                {trend === 'up' && <TrendingUp className='h-2 w-2' />}
                {trend === 'up'
                  ? '+4.2%'
                  : trend === 'down'
                    ? '-1.5%'
                    : 'Stable'}
              </div>
            </div>
          </div>
          <div className='text-right pr-6'>
            <span className='text-[9px] font-bold text-zinc-400 uppercase tracking-wider block'>
              Target Date
            </span>
            <span className='text-[11px] font-bold text-zinc-900'>
              Jan 12, 2025
            </span>
          </div>
        </div>
      </CardHeader>

      <div className='px-2 py-1'>
        <div className='h-px bg-zinc-50 w-full' />
      </div>

      <CardContent className='p-2 pt-1 pb-1'>
        <div className='mb-1.5 flex justify-between items-center'>
          <span className='text-[9px] font-bold text-zinc-400 uppercase flex items-center gap-1'>
            <TrendingUp className='h-2.5 w-2.5' /> Trajectory
          </span>
          <span className='text-[9px] font-bold text-green-600 uppercase tracking-wider flex items-center gap-1'>
            <Target className='h-2.5 w-2.5' /> Target: 85%
          </span>
        </div>
        <div className='h-[120px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart
              data={MOCK_WEEKLY_DATA}
              margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id='colorScoreUnified'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop offset='5%' stopColor='#2563eb' stopOpacity={0.15} />
                  <stop offset='95%' stopColor='#2563eb' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray='3 3'
                vertical={false}
                stroke='#f4f4f5'
              />
              <XAxis
                dataKey='week'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 8, fill: '#aeaeb2' }}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  borderRadius: '4px',
                  border: '1px solid #e4e4e7',
                  fontSize: '10px',
                }}
              />
              <Legend
                verticalAlign='top'
                align='right'
                height={15}
                iconType='circle'
                wrapperStyle={{
                  fontSize: '8px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}
              />
              <ReferenceLine
                y={85}
                stroke='#10b981'
                strokeDasharray='4 4'
                strokeWidth={1}
              />
              <Area
                name='Your Score'
                type='monotone'
                dataKey='score'
                stroke='#2563eb'
                strokeWidth={1.5}
                fillOpacity={1}
                fill='url(#colorScoreUnified)'
                dot={{ r: 2, fill: '#2563eb', stroke: '#fff', strokeWidth: 1 }}
              />
              <Line
                name='Peer Avg'
                type='monotone'
                dataKey='peerAverage'
                stroke='#d4d4d8'
                strokeDasharray='5 5'
                strokeWidth={1.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export const PredictiveRemediationCard = () => (
  <Card className='rounded-sm border-blue-100 bg-blue-50 shadow-none p-2 text-blue-900 relative overflow-hidden group flex flex-col justify-center h-full'>
    <RichInfoPopover
      title='Targeted Intervention'
      description='System scan isolating your lowest-performing node for correction.'
    />
    <div className='absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity'>
      <Zap className='h-24 w-24' />
    </div>
    <div className='relative z-10 flex flex-col p-2 h-full justify-between'>
      <div>
        <div className='inline-flex items-center gap-1.5 bg-blue-100 px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest mb-2 text-blue-700'>
          <AlertCircle className='h-2.5 w-2.5' /> Recommendation
        </div>
        <h3 className='text-[16px] font-bold leading-tight'>
          Predictive Remediation
        </h3>
        <p className='text-[11px] text-blue-700 mt-1 leading-snug'>
          Algorithm detected decaying mastery in{' '}
          <span className='font-bold text-blue-900'>Pharmacokinetics</span>.
        </p>
        <div className='mt-3 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-medium border border-blue-200'>
          <Info className='h-2.5 w-2.5' /> Node: PD 1096 (14%)
        </div>
      </div>
      <Button className='bg-blue-600 text-white hover:bg-blue-700 rounded-sm font-bold text-[10px] uppercase tracking-widest px-4 h-9 shadow-lg mt-4 w-full'>
        Start Remediation
      </Button>
    </div>
  </Card>
)

export const DailyCrucibleCard = () => (
  <Card className='rounded-sm border-zinc-200 bg-white shadow-none p-2 h-[128px] flex flex-col gap-2 relative'>
    <RichInfoPopover
      title='Daily Crucible'
      description='Single high-difficulty item drawn from your weakest topic.'
    />
    <div>
      <span className='text-[9px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1'>
        <Zap className='h-2.5 w-2.5 text-blue-600' /> Daily Crucible
      </span>
      <p className='text-[11px] font-medium text-zinc-900 mt-1 leading-tight italic pr-4'>
        "Max travel distance to an exit without sprinklers?"
      </p>
    </div>
    <Button
      variant='outline'
      className='h-7 text-[9px] font-bold uppercase tracking-widest mt-1 w-full border-zinc-100 hover:bg-zinc-50'
    >
      Answer
    </Button>
  </Card>
)

export const PacingLeaksCard = () => (
  <Card className='rounded-sm border-zinc-200 bg-white shadow-none p-2 relative h-[128px]'>
    <RichInfoPopover
      title='Latency Analytics'
      description='Tracks average time spent per question against the exam standard.'
    />
    <span className='text-[9px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1'>
      <Timer className='h-2.5 w-2.5 text-amber-500' /> Pacing Leaks
    </span>
    <div className='mt-1 flex items-start gap-1.5'>
      <AlertCircle className='h-3.5 w-3.5 text-amber-500 mt-0.5' />
      <p className='text-[10px] text-zinc-600 leading-tight'>
        You spend <span className='font-bold text-zinc-900'>2.4x</span> target
        time on <span className='font-bold text-zinc-900'>Steel Conn.</span>
      </p>
    </div>
  </Card>
)

export const PinnedRecentActivity = () => (
  <Card className='rounded-sm border-zinc-200 bg-white shadow-none flex-1 flex flex-col overflow-hidden h-full p-2 relative'>
    <RichInfoPopover
      title='System Engagement'
      description='Chronological record of system interactions.'
    />
    <CardHeader className='p-2 pt-1 border-b border-zinc-50'>
      <CardTitle className='text-[10px] font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-2'>
        <Clock className='h-3 w-3' /> Recent Activity
      </CardTitle>
    </CardHeader>
    <CardContent className='p-0 flex-1 overflow-hidden'>
      <div className='h-full overflow-y-auto p-2 space-y-4 wiki-sidebar-scroll'>
        {MOCK_RECENT_ACTIVITY.map((item, idx) => (
          <div key={item.id} className='relative flex gap-3'>
            {idx !== MOCK_RECENT_ACTIVITY.length - 1 && (
              <div className='absolute left-[11px] top-[22px] bottom-[-18px] w-px bg-zinc-50' />
            )}
            <div className='mt-0.5 z-10 rounded-full bg-white border border-zinc-50 p-1 h-fit shadow-sm'>
              <item.icon className='h-3 w-3 text-zinc-400' />
            </div>
            <div className='flex flex-col gap-0.5'>
              <span className='text-[8px] font-bold text-zinc-400 uppercase tracking-tight leading-none'>
                {item.time}
              </span>
              <h4 className='text-[11px] font-bold text-zinc-900 leading-tight'>
                {item.title}
              </h4>
              <p className='text-[10px] text-zinc-500 font-medium leading-tight'>
                {item.detail}
              </p>
            </div>
          </div>
        ))}
        <div className='pt-2'>
          <Button
            variant='ghost'
            className='w-full text-[9px] font-bold text-zinc-400 uppercase tracking-widest hover:bg-zinc-50 py-2 h-auto'
          >
            View History
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)
