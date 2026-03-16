'use client'

import { Card } from '@/components/ui/card'
import { Calendar, Flame, Timer, TrendingUp } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'

const SPARK_DATA = [
  { val: 62 }, { val: 64 }, { val: 63 }, { val: 66 }, { val: 65 }, { val: 68 }, { val: 70 }
]

export const TrendMetrics = () => {
  return (
    <div className='grid grid-cols-2 gap-2'>
      <MetricCard icon={<Calendar className='h-3 w-3 text-zinc-400' />} label="Exam Goal" val="42" unit="Days Left" />
      <MetricCard icon={<Flame className='h-3 w-3 text-orange-500' />} label="Daily Streak" val="12" unit="Days" />
      <MetricCard icon={<Timer className='h-3 w-3 text-zinc-400' />} label="Pacing" val="1.4" unit="Min/Q" />
      
      <Card className='border-zinc-200 bg-white shadow-none p-3 flex flex-col justify-between h-[68px]'>
        <div className='flex flex-col gap-0.5'>
          <span className='text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1'>
            <TrendingUp className='h-3 w-3 text-green-600' /> Weekly Trend
          </span>
          <div className='h-8 w-full -mt-1'>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SPARK_DATA}>
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                <Line 
                  type="monotone" 
                  dataKey="val" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={false} 
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  )
}

const MetricCard = ({ icon, label, val, unit }: any) => (
  <Card className='border-zinc-200 bg-white shadow-none p-3 h-[68px]'>
    <div className='flex flex-col gap-0.5'>
      <span className='text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 leading-none'>
        {icon} {label}
      </span>
      <div className='flex items-baseline gap-1 mt-1'>
        <span className='text-xl font-bold text-zinc-900 leading-none'>{val}</span>
        <span className='text-[10px] font-medium text-zinc-500 uppercase tracking-tight leading-none'>{unit}</span>
      </div>
    </div>
  </Card>
)
