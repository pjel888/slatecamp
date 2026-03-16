'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Flame, Clock, CheckCircle2, StickyNote, Flag, TrendingUp, Timer, Award } from 'lucide-react'
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
  { id: 1, time: '10:42 AM', title: 'Completed 25-item Camp Quiz', detail: 'Architectural Practice → Score: 76%', icon: CheckCircle2 },
  { id: 2, time: '9:15 AM', title: 'Read Wiki Article', detail: 'PD 1096 - National Building Code', icon: StickyNote },
  { id: 3, time: 'Yesterday', title: 'Saved 3 New Notes', detail: 'Structural Design - Lateral Loads', icon: StickyNote },
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
  <Card className='border-zinc-200 bg-white shadow-none p-4 rounded-sm'>
    <div className='flex items-center justify-between'>
      <div>
        <span className='text-[10px] font-bold text-zinc-400 uppercase tracking-wider'>Exam Goal</span>
        <h3 className='text-xl font-bold text-zinc-900 mt-1'>14 Days To Go</h3>
        <p className='text-[10px] text-zinc-500 font-medium'>Jan 12 Exam</p>
      </div>
      <div className='relative h-10 w-10'>
         <svg className="h-full w-full" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="none" className="stroke-zinc-100" strokeWidth="3"></circle>
          <circle cx="18" cy="18" r="16" fill="none" className="stroke-blue-600" strokeWidth="3" strokeDasharray="100" strokeDashoffset="25" strokeLinecap="round"></circle>
        </svg>
        <div className='absolute inset-0 flex items-center justify-center text-[10px] font-bold text-blue-600'>85%</div>
      </div>
    </div>
  </Card>
)

export const StudyStreakCard = () => (
  <Card className='border-zinc-200 bg-white shadow-none p-4 rounded-sm'>
    <div className='flex items-center gap-3'>
      <div className='rounded-full bg-orange-50 p-2'>
        <Flame className='h-5 w-5 text-orange-500' />
      </div>
      <div>
        <span className='text-[10px] font-bold text-zinc-400 uppercase tracking-wider'>Current Momentum</span>
        <h3 className='text-xl font-bold text-zinc-900 mt-0.5'>7-Day Streak</h3>
        <p className='text-[10px] text-orange-600 font-bold uppercase'>Keep it up!</p>
      </div>
    </div>
  </Card>
)

export const ActivityLogFeedCard = () => (
  <Card className='border-zinc-200 bg-white shadow-none rounded-sm'>
    <CardHeader className='pb-2 border-b border-zinc-50'>
      <CardTitle className='text-[11px] font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-2'>
        <Clock className='h-3.5 w-3.5' /> Momentum Feed
      </CardTitle>
    </CardHeader>
    <CardContent className='p-0'>
      <div className='max-h-[220px] overflow-y-auto wiki-sidebar-scroll'>
        {MOCK_ACTIVITY_FEED.map((item, idx) => (
          <div key={item.id} className={cn('p-4 flex gap-3', idx !== MOCK_ACTIVITY_FEED.length - 1 && 'border-b border-zinc-50')}>
            <div className='mt-0.5 rounded bg-zinc-50 p-1.5 h-fit'>
              <item.icon className='h-3.5 w-3.5 text-zinc-400' />
            </div>
            <div className='flex flex-col gap-0.5'>
              <div className='flex items-center gap-2'>
                <span className='text-[10px] font-bold text-zinc-400 uppercase'>{item.time}</span>
                <span className='h-1 w-1 rounded-full bg-zinc-200' />
                <span className='text-[12px] font-semibold text-zinc-900'>{item.title}</span>
              </div>
              <p className='text-[11px] text-zinc-500 leading-tight'>{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

export const DetailedWeeklyReadinessTrendCard = () => (
  <Card className='border-zinc-200 bg-white shadow-none rounded-sm p-4'>
    <div className='flex items-start justify-between mb-4'>
      <div>
        <span className='text-[10px] font-bold text-zinc-400 uppercase tracking-wider'>Performance Trend</span>
        <h3 className='text-lg font-bold text-zinc-900'>Weekly Readiness</h3>
      </div>
      <div className='text-right'>
        <span className='text-[10px] font-bold text-green-600 uppercase tracking-wider flex items-center justify-end gap-1'>
          <TrendingUp className='h-3 w-3' /> +4% Overall
        </span>
        <p className='text-[11px] font-bold text-zinc-900'>W8: 76%</p>
      </div>
    </div>
    <div className='h-[120px] w-full'>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={MOCK_WEEKLY_TREND}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
          <XAxis dataKey="week" hide />
          <YAxis domain={['dataMin - 5', 100]} hide />
          <Tooltip 
            contentStyle={{ borderRadius: '4px', border: '1px solid #e4e4e7', fontSize: '10px' }}
            itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#2563eb" 
            strokeWidth={2.5} 
            dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }} 
            activeDot={{ r: 5, fill: '#2563eb' }}
            label={{ position: 'top', fontSize: 9, fill: '#71717a', offset: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </Card>
)

export const PacingAndDomainBreakdownCard = () => (
  <Card className='border-zinc-200 bg-white shadow-none rounded-sm p-4'>
    <div className='space-y-4'>
      <div>
        <span className='text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1'>
          <Timer className='h-3 w-3' /> Pacing Analysis
        </span>
        <div className='flex items-baseline gap-1.5 mt-1'>
          <span className='text-xl font-bold text-zinc-900'>1:15</span>
          <span className='text-[10px] font-medium text-zinc-500 uppercase tracking-tight'>Min / Q</span>
        </div>
        <p className='text-[9px] text-green-600 font-bold mt-0.5 uppercase tracking-tighter'>-0:15 under target (1:30)</p>
      </div>
      
      <div className='space-y-2 pt-2 border-t border-zinc-50'>
        <span className='text-[10px] font-bold text-zinc-400 uppercase tracking-wider'>Domain Accuracy</span>
        {MOCK_DOMAINS.map(domain => (
          <div key={domain.name} className='flex flex-col gap-1'>
            <div className='flex justify-between text-[10px] font-medium'>
              <span className='text-zinc-600 truncate max-w-[100px]'>{domain.name}</span>
              <span className='text-zinc-900 font-bold'>{domain.acc}%</span>
            </div>
            <div className='h-1 w-full bg-zinc-100 rounded-full overflow-hidden'>
              <div 
                className={cn('h-full rounded-full transition-all', domain.acc > 75 ? 'bg-green-500' : 'bg-blue-500')} 
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
  <Card className='border-zinc-200 bg-white shadow-none rounded-sm'>
    <CardHeader className='pb-2 border-b border-zinc-50'>
      <CardTitle className='text-[11px] font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-2'>
        <Award className='h-3.5 w-3.5' /> Candidate Standings
      </CardTitle>
    </CardHeader>
    <CardContent className='p-0'>
      <table className='w-full text-left'>
        <thead>
          <tr className='border-b border-zinc-50'>
            <th className='px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-tight'>Rank</th>
            <th className='px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-tight'>Candidate</th>
            <th className='px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-tight text-right'>EMA</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_LEADERBOARD.map((item) => (
            <tr key={item.name} className={cn('border-b border-zinc-50 last:border-0', item.isUser && 'bg-blue-50/50')}>
              <td className='px-4 py-2.5 text-[11px] font-bold text-zinc-500'>#{item.rank}</td>
              <td className='px-4 py-2.5 text-[11px] font-semibold text-zinc-900'>{item.name}</td>
              <td className='px-4 py-2.5 text-[11px] font-bold text-zinc-900 text-right'>{item.score.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='p-3 bg-zinc-50/50 text-center'>
        <p className='text-[10px] font-medium text-zinc-400 uppercase tracking-wider'>Showing snippet of 1,452 Candidates</p>
      </div>
    </CardContent>
  </Card>
)
