'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CalendarBlank,
  Fire,
  Timer,
  TrendUp,
  CheckCircle,
  Clock,
  Note,
  Flag,
  Warning,
  Lightning,
  Cube,
  Target,
  Info,
  BookOpen,
} from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
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
    icon: CheckCircle,
  },
  {
    id: 2,
    time: '9:15 AM',
    title: 'Read Wiki: PD 1096',
    detail: 'National Building Code',
    icon: Note,
  },
  {
    id: 3,
    time: 'Yesterday',
    title: 'Saved 3 Notes',
    detail: 'Structural Design - Lateral Loads',
    icon: Note,
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
    icon: Cube,
  },
  {
    id: 6,
    time: '3 days ago',
    title: 'Completed 10-item Storm',
    detail: 'Building Utilities (92%)',
    icon: Lightning,
  },
  {
    id: 7,
    time: '4 days ago',
    title: 'Read Wiki: Rule 7 & 8',
    detail: 'Setbacks and Incremental',
    icon: Note,
  },
]

// --- Sub-components ---

const ICON_MAP = {
  timer: Timer,
  calendar: CalendarBlank,
  flame: Fire,
  alert: Warning,
  clock: Clock,
  zap: Lightning,
  book: BookOpen,
}

const COPY_MAP = {
  timer: {
    title: 'Pacing Insights',
    desc: 'Shows your average time per question compared to the exam target — helpful for knowing when to move on.',
  },
  calendar: {
    title: 'Exam Goal',
    desc: 'Days remaining until your target exam date.',
  },
  flame: {
    title: 'Study Momentum',
    desc: 'Your recent study activity and consistency over time.',
  },
  book: {
    title: 'Review Queue',
    desc: 'Topics scheduled for spaced repetition review to keep knowledge fresh.',
  },
  alert: {
    title: 'Areas to Revisit',
    desc: 'Topics where focused practice would make the biggest difference right now.',
  },
  clock: {
    title: 'Extended Practice',
    desc: "Gradually longer sessions to build the focus you'll need on exam day.",
  },
  zap: {
    title: 'Full Exam Simulation',
    desc: 'Full-length exam rehearsal. Detailed review unlocks 24 hours after completion.',
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
    <Card className='border-border bg-white p-2 relative'>
      <RichInfoPopover title={copy.title} description={copy.desc} />
      <div className='flex items-center gap-2'>
        <div
          className={cn(
            'p-1.5 rounded-sm bg-[#EEF2FC]',
            color === 'orange' && 'bg-orange-50',
            color === 'amber' && 'bg-amber-50',
          )}
        >
          <SCIcon
            icon={Icon}
            size='xs'
            className={cn(
              color === 'orange' && 'text-orange-500',
              color === 'amber' && 'text-amber-600',
            )}
            color={!color || color === 'zinc' ? '#8896A7' : undefined}
          />
        </div>
        <div>
          <p
            className='text-[11px] font-bold uppercase tracking-wider leading-none'
            style={{ color: '#8896A7' }}
          >
            {label}
          </p>
          <div className='flex items-baseline gap-1 mt-0.5'>
            <span
              className='text-lg font-bold leading-none'
              style={{ color: '#1A2332' }}
            >
              {val}
            </span>
            <span
              className='text-[11px] font-medium uppercase tracking-tight'
              style={{ color: '#4A5568' }}
            >
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
    <Card className='border-border bg-white p-2 flex flex-col justify-between hover:border-primary/20 hover:bg-[#EEF2FC]/20 transition-all cursor-pointer group flex-1 relative'>
      <RichInfoPopover title={copy.title} description={copy.desc} />
      <div>
        <div className='p-1.5 rounded-sm bg-[#EEF2FC] group-hover:bg-[#E3ECF5] w-fit'>
          <SCIcon
            icon={Icon}
            size='sm'
            className='group-hover:text-primary'
            color='#8896A7'
          />
        </div>
        <h4
          className='text-[12px] font-bold mt-2 leading-tight'
          style={{ color: '#1A2332' }}
        >
          {title}
        </h4>
        <p
          className='text-[11px] mt-1 leading-snug'
          style={{ color: '#4A5568' }}
        >
          {detail}
        </p>
      </div>
      <Button
        variant='ghost'
        className='p-0 h-auto text-[11px] font-bold text-primary uppercase tracking-widest mt-3 justify-start hover:bg-transparent'
      >
        Start →
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
    <Card className='border-border bg-white overflow-hidden flex flex-col p-2 relative'>
      <RichInfoPopover
        title='Your Readiness Score'
        description='A composite score combining recent performance trends and question difficulty. The more you practice, the more accurate this becomes.'
      />
      <CardHeader className='p-2 pt-1'>
        <div className='flex justify-between items-start'>
          <div>
            <CardTitle
              className='text-[11px] font-bold tracking-wider uppercase'
              style={{ color: '#4A5568' }}
            >
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
                  'flex items-center gap-1 px-1 py-0.5 rounded-full text-[11px] font-bold uppercase',
                  trend === 'up' && 'bg-green-50 text-green-700',
                  trend === 'down' && 'bg-red-50 text-red-700',
                  trend === 'flat' && 'bg-[#EEF2FC]',
                )}
                style={trend === 'flat' ? { color: '#4A5568' } : undefined}
              >
                {trend === 'up' && <SCIcon icon={TrendUp} size='xs' />}
                {trend === 'up'
                  ? '+4.2%'
                  : trend === 'down'
                    ? '-1.5%'
                    : 'Stable'}
              </div>
            </div>
          </div>
          <div className='text-right pr-6'>
            <span
              className='text-[11px] font-bold uppercase tracking-wider block'
              style={{ color: '#8896A7' }}
            >
              Target Date
            </span>
            <span
              className='text-[11px] font-bold'
              style={{ color: '#1A2332' }}
            >
              Jan 12, 2025
            </span>
          </div>
        </div>
      </CardHeader>

      <div className='px-2 py-1'>
        <div className='h-px bg-[#EEF2FC] w-full' />
      </div>

      <CardContent className='p-2 pt-1 pb-1'>
        <div className='mb-1.5 flex justify-between items-center'>
          <span
            className='text-[11px] font-bold uppercase flex items-center gap-1'
            style={{ color: '#8896A7' }}
          >
            <SCIcon icon={TrendUp} size='xs' /> Trajectory
          </span>
          <span className='text-[11px] font-bold text-green-600 uppercase tracking-wider flex items-center gap-1'>
            <SCIcon icon={Target} size='xs' /> Target: 85%
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
                  <stop offset='5%' stopColor='#1B3FC4' stopOpacity={0.15} />
                  <stop offset='95%' stopColor='#1B3FC4' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray='3 3'
                vertical={false}
                stroke='#D4DAE3'
              />
              <XAxis
                dataKey='week'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 8, fill: '#8896A7' }}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #D4DAE3',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  fontSize: '12px',
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
                stroke='#2D9F6F'
                strokeDasharray='4 4'
                strokeWidth={1}
              />
              <Area
                name='Your Score'
                type='monotone'
                dataKey='score'
                stroke='#1B3FC4'
                strokeWidth={1.5}
                fillOpacity={1}
                fill='url(#colorScoreUnified)'
                dot={{ r: 2, fill: '#1B3FC4', stroke: '#fff', strokeWidth: 1 }}
              />
              <Line
                name='Peer Avg'
                type='monotone'
                dataKey='peerAverage'
                stroke='#D4DAE3'
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
  <Card className='border-primary/10 bg-[#EEF2FC] shadow-none p-2 text-[#1A3A5C] relative overflow-hidden group flex flex-col justify-center h-full'>
    <RichInfoPopover
      title='Suggested Review'
      description='A topic where a short practice session would reinforce your understanding right now.'
    />
    <div className='absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity'>
      <SCIcon icon={Lightning} size='2xl' className='h-24 w-24' />
    </div>
    <div className='relative z-10 flex flex-col p-2 h-full justify-between'>
      <div>
        <div className='inline-flex items-center gap-1.5 bg-primary/10 px-1.5 py-0.5 rounded-sm text-[11px] font-bold uppercase tracking-widest mb-2 text-[#1535A8]'>
          <SCIcon icon={Warning} size='xs' /> Suggested for You
        </div>
        <h3 className='text-[16px] font-bold leading-tight'>Focused Review</h3>
        <p className='text-[11px] text-[#1535A8] mt-1 leading-snug'>
          Your grasp of{' '}
          <span className='font-bold text-[#1A3A5C]'>Pharmacokinetics</span>{' '}
          could use a refresh — a quick practice session will help it stick.
        </p>
        <div className='mt-3 inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-[#1F4468] rounded-full text-[11px] font-medium border border-primary/20'>
          <SCIcon icon={Info} size='xs' /> Topic: PD 1096 (14% mastery)
        </div>
      </div>
      <Button className='bg-primary text-white hover:bg-[#1535A8] rounded-sm font-bold text-[11px] uppercase tracking-widest px-4 h-9 shadow-lg mt-4 w-full'>
        Start 10-Question Review
      </Button>
    </div>
  </Card>
)

export const DailyCrucibleCard = () => (
  <Card className='border-border bg-white p-2 h-[128px] flex flex-col gap-2 relative'>
    <RichInfoPopover
      title='Daily Challenge'
      description='One carefully chosen question from a topic that will stretch your thinking today.'
    />
    <div>
      <span
        className='text-[11px] font-bold uppercase tracking-wider flex items-center gap-1'
        style={{ color: '#8896A7' }}
      >
        <SCIcon icon={Lightning} size='xs' className='text-primary' /> Daily
        Challenge
      </span>
      <p
        className='text-[11px] font-medium mt-1 leading-tight italic pr-4'
        style={{ color: '#1A2332' }}
      >
        "Max travel distance to an exit without sprinklers?"
      </p>
    </div>
    <Button
      variant='outline'
      className='h-7 text-[11px] font-bold uppercase tracking-widest mt-1 w-full border-[#D4DAE3] hover:bg-[#EEF2FC]'
    >
      Answer
    </Button>
  </Card>
)

export const PacingLeaksCard = () => (
  <Card className='border-border bg-white p-2 relative h-[128px]'>
    <RichInfoPopover
      title='Pacing Insights'
      description='Shows your average time per question compared to the exam target — helpful for knowing when to move on.'
    />
    <span
      className='text-[11px] font-bold uppercase tracking-wider flex items-center gap-1'
      style={{ color: '#8896A7' }}
    >
      <SCIcon icon={Timer} size='xs' className='text-amber-500' /> Pacing
      Insights
    </span>
    <div className='mt-1 flex items-start gap-1.5'>
      <SCIcon icon={Warning} size='xs' className='text-amber-500 mt-0.5' />
      <p className='text-[11px] leading-tight' style={{ color: '#4A5568' }}>
        <span className='font-bold' style={{ color: '#1A2332' }}>
          Steel Conn.
        </span>{' '}
        takes you{' '}
        <span className='font-bold' style={{ color: '#1A2332' }}>
          2.4x
        </span>{' '}
        longer than your target pace — worth a closer look.
      </p>
    </div>
  </Card>
)

export const PinnedRecentActivity = () => (
  <Card className='border-border bg-white flex-1 flex flex-col overflow-hidden h-full p-2 relative'>
    <RichInfoPopover
      title='Recent Activity'
      description='A record of your recent sessions, notes, and wiki reads.'
    />
    <CardHeader className='p-2 pt-1 border-b border-[#D4DAE3]'>
      <CardTitle
        className='text-[11px] font-bold tracking-wider uppercase flex items-center gap-2'
        style={{ color: '#4A5568' }}
      >
        <SCIcon icon={Clock} size='xs' /> Recent Activity
      </CardTitle>
    </CardHeader>
    <CardContent className='p-0 flex-1 overflow-hidden'>
      <div className='h-full overflow-y-auto p-2 space-y-4 wiki-sidebar-scroll'>
        {MOCK_RECENT_ACTIVITY.map((item, idx) => (
          <div key={item.id} className='relative flex gap-3'>
            {idx !== MOCK_RECENT_ACTIVITY.length - 1 && (
              <div className='absolute left-[11px] top-[22px] bottom-[-18px] w-px bg-[#EEF2FC]' />
            )}
            <div className='mt-0.5 z-10 rounded-full bg-white border border-[#D4DAE3] p-1 h-fit shadow-sm'>
              <SCIcon icon={item.icon} size='xs' color='#8896A7' />
            </div>
            <div className='flex flex-col gap-0.5'>
              <span
                className='text-[11px] font-bold uppercase tracking-tight leading-none'
                style={{ color: '#8896A7' }}
              >
                {item.time}
              </span>
              <h4
                className='text-[11px] font-bold leading-tight'
                style={{ color: '#1A2332' }}
              >
                {item.title}
              </h4>
              <p
                className='text-[11px] font-medium leading-tight'
                style={{ color: '#4A5568' }}
              >
                {item.detail}
              </p>
            </div>
          </div>
        ))}
        <div className='pt-2'>
          <Button
            variant='ghost'
            className='w-full text-[11px] font-bold uppercase tracking-widest hover:bg-[#EEF2FC] py-2 h-auto'
            style={{ color: '#8896A7' }}
          >
            View History
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)
