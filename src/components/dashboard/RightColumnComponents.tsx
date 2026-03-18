'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarBlank, Fire, Clock, CheckCircle, Note, Flag, TrendUp, Timer, Medal } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from 'recharts'
import { cn } from '@/lib/utils'

// --- Mock Data ---

const MOCK_WEEKLY_TREND = [
  { week: 'W1', score: 64 },
  { week: 'W2', score: 66 },
  { week: 'W3', score: 65 },
  { week: 'W4', score: 68 },
  { week: 'W5', score: 72 },
  { week: 'W6', score: 70 },
  { week: 'W7', score: 74 },
  { week: 'W8', score: 76 },
]

const MOCK_ACTIVITY_FEED = [
  { id: 1, time: '10:42 AM', title: 'Completed 25-item Camp Quiz', detail: 'Architectural Practice → Score: 76%', icon: CheckCircle },
  { id: 2, time: '9:15 AM', title: 'Read Wiki Article', detail: 'PD 1096 - National Building Code', icon: Note },
  { id: 3, time: 'Yesterday', title: 'Saved 3 New Notes', detail: 'Structural Design - Lateral Loads', icon: Note },
  { id: 4, time: 'Yesterday', title: 'Flagged 4 High-Yield Items', detail: 'Professional Practice Ethics', icon: Flag },
]

const MOCK_DOMAINS = [
  { name: 'Structural Design', acc: 68 },
  { name: 'Professional Practice', acc: 82 },
  { name: 'Building Utilities', acc: 74 },
]

const MOCK_LEADERBOARD = [
  { name: 'ArchUser_42', score: 72.4, rank: 88 },
  { name: '(You)', score: 68.2, rank: 112, isUser: true },
  { name: 'Draftsman99', score: 65.1, rank: 145 },
]

// --- Components ---

export const DaysUntilExamCard = () => (
  <Card className='border-0 bg-white shadow-none p-4 rounded-sm'>
    <div className='flex items-center justify-between'>
      <div>
        <span className='text-[11px] font-bold uppercase tracking-wider' style={{ color: '#8896A7' }}>Exam Goal</span>
        <h3 className='text-xl font-bold mt-1' style={{ color: '#1A2332' }}>14 Days Away</h3>
        <p className='text-[11px] font-medium' style={{ color: '#4A5568' }}>Jan 12 Exam</p>
      </div>
      <div className='relative h-10 w-10'>
         <svg className="h-full w-full" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="none" className="stroke-zinc-100" strokeWidth="3"></circle>
          <circle cx="18" cy="18" r="16" fill="none" className="stroke-primary" strokeWidth="3" strokeDasharray="100" strokeDashoffset="25" strokeLinecap="round"></circle>
        </svg>
        <div className='absolute inset-0 flex items-center justify-center text-[11px] font-bold text-primary'>85%</div>
      </div>
    </div>
  </Card>
)

export const StudyStreakCard = () => (
  <Card className='border-0 bg-white shadow-none p-4 rounded-sm'>
    <div className='flex items-center gap-3'>
      <div className='rounded-full bg-orange-50 p-2'>
        <SCIcon icon={Fire} size='md' className='text-orange-500' />
      </div>
      <div>
        <span className='text-[11px] font-bold uppercase tracking-wider' style={{ color: '#8896A7' }}>Study Momentum</span>
        <h3 className='text-xl font-bold mt-0.5' style={{ color: '#1A2332' }}>7 Days Running</h3>
        <p className='text-[11px] text-orange-600 font-bold uppercase'>Great consistency!</p>
      </div>
    </div>
  </Card>
)

export const ActivityLogFeedCard = () => (
  <Card className='border-0 bg-white shadow-none rounded-sm'>
    <CardHeader className='pb-2 border-b border-[#D4DAE3]'>
      <CardTitle className='text-[11px] font-bold tracking-wider uppercase flex items-center gap-2' style={{ color: '#4A5568' }}>
        <SCIcon icon={Clock} size='xs' /> Recent Activity
      </CardTitle>
    </CardHeader>
    <CardContent className='p-0'>
      <div className='max-h-[220px] overflow-y-auto wiki-sidebar-scroll'>
        {MOCK_ACTIVITY_FEED.map((item, idx) => (
          <div key={item.id} className={cn('p-4 flex gap-3', idx !== MOCK_ACTIVITY_FEED.length - 1 && 'border-b border-[#D4DAE3]')}>
            <div className='mt-0.5 rounded bg-[#EEF2FC] p-1.5 h-fit'>
              <SCIcon icon={item.icon} size='xs' color='#8896A7' />
            </div>
            <div className='flex flex-col gap-0.5'>
              <div className='flex items-center gap-2'>
                <span className='text-[11px] font-bold uppercase' style={{ color: '#8896A7' }}>{item.time}</span>
                <span className='h-1 w-1 rounded-full bg-[#D4DAE3]' />
                <span className='text-[12px] font-semibold' style={{ color: '#1A2332' }}>{item.title}</span>
              </div>
              <p className='text-[11px] leading-tight' style={{ color: '#4A5568' }}>{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

export const DetailedWeeklyReadinessTrendCard = () => (
  <Card className='border-0 bg-white shadow-none rounded-sm p-4'>
    <div className='flex items-start justify-between mb-4'>
      <div>
        <span className='text-[11px] font-bold uppercase tracking-wider' style={{ color: '#8896A7' }}>Your Progress</span>
        <h3 className='text-lg font-bold' style={{ color: '#1A2332' }}>Weekly Readiness</h3>
      </div>
      <div className='text-right'>
        <span className='text-[11px] font-bold text-green-600 uppercase tracking-wider flex items-center justify-end gap-1'>
          <SCIcon icon={TrendUp} size='xs' /> +4% Overall
        </span>
        <p className='text-[11px] font-bold' style={{ color: '#1A2332' }}>W8: 76%</p>
      </div>
    </div>
    <div className='h-[120px] w-full'>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={MOCK_WEEKLY_TREND}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D4DAE3" />
          <XAxis dataKey="week" hide />
          <YAxis domain={['dataMin - 5', 100]} hide />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #D4DAE3', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '12px' }}
            itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#1B3FC4"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#1B3FC4', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#1B3FC4' }}
            label={{ position: 'top', fontSize: 9, fill: '#4A5568', offset: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </Card>
)

export const PacingAndDomainBreakdownCard = () => (
  <Card className='border-0 bg-white shadow-none rounded-sm p-4'>
    <div className='space-y-4'>
      <div>
        <span className='text-[11px] font-bold uppercase tracking-wider flex items-center gap-1' style={{ color: '#8896A7' }}>
          <SCIcon icon={Timer} size='xs' /> Pacing Insights
        </span>
        <div className='flex items-baseline gap-1.5 mt-1'>
          <span className='text-xl font-bold' style={{ color: '#1A2332' }}>1:15</span>
          <span className='text-[11px] font-medium uppercase tracking-tight' style={{ color: '#4A5568' }}>Min / Q</span>
        </div>
        <p className='text-[11px] text-green-600 font-bold mt-0.5 uppercase tracking-tighter'>0:15 ahead of target (1:30)</p>
      </div>

      <div className='space-y-2 pt-2 border-t border-[#D4DAE3]'>
        <span className='text-[11px] font-bold uppercase tracking-wider' style={{ color: '#8896A7' }}>Areas Covered</span>
        {MOCK_DOMAINS.map(domain => (
          <div key={domain.name} className='flex flex-col gap-1'>
            <div className='flex justify-between text-[11px] font-medium'>
              <span className='truncate max-w-[100px]' style={{ color: '#4A5568' }}>{domain.name}</span>
              <span className='font-bold' style={{ color: '#1A2332' }}>{domain.acc}%</span>
            </div>
            <div className='h-1 w-full rounded-full overflow-hidden' style={{ backgroundColor: '#D4DAE3' }}>
              <div
                className={cn('h-full rounded-full transition-all', domain.acc > 75 ? 'bg-[#2D9F6F]' : 'bg-[#1B3FC4]')}
                style={{ width: `${domain.acc}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  </Card>
)

export const LeaderboardSnippetCard = () => (
  <Card className='border-0 bg-white shadow-none rounded-sm'>
    <CardHeader className='pb-2 border-b border-[#D4DAE3]'>
      <CardTitle className='text-[11px] font-bold tracking-wider uppercase flex items-center gap-2' style={{ color: '#4A5568' }}>
        <SCIcon icon={Medal} size='xs' /> Where You Stand
      </CardTitle>
    </CardHeader>
    <CardContent className='p-0'>
      <table className='w-full text-left'>
        <thead>
          <tr className='border-b border-[#D4DAE3]'>
            <th className='px-4 py-2 text-[11px] font-bold uppercase tracking-tight' style={{ color: '#8896A7' }}>Rank</th>
            <th className='px-4 py-2 text-[11px] font-bold uppercase tracking-tight' style={{ color: '#8896A7' }}>Candidate</th>
            <th className='px-4 py-2 text-[11px] font-bold uppercase tracking-tight text-right' style={{ color: '#8896A7' }}>EMA</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_LEADERBOARD.map((item) => (
            <tr key={item.name} className={cn('border-b border-[#D4DAE3] last:border-0', item.isUser && 'bg-[#EEF2FC]/50')}>
              <td className='px-4 py-2.5 text-[11px] font-bold' style={{ color: '#4A5568' }}>#{item.rank}</td>
              <td className='px-4 py-2.5 text-[11px] font-semibold' style={{ color: '#1A2332' }}>{item.name}</td>
              <td className='px-4 py-2.5 text-[11px] font-bold text-right' style={{ color: '#1A2332' }}>{item.score.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='p-3 text-center' style={{ backgroundColor: '#EEF2FC' }}>
        <p className='text-[11px] font-medium uppercase tracking-wider' style={{ color: '#8896A7' }}>Showing your position among 1,452 candidates</p>
      </div>
    </CardContent>
  </Card>
)
