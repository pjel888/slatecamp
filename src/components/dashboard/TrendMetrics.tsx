'use client'

import { Card } from '@/components/ui/card'
import { CalendarBlank, Timer, TrendUp } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'

const SPARK_DATA = [
  { val: 62 }, { val: 64 }, { val: 63 }, { val: 66 }, { val: 65 }, { val: 68 }, { val: 70 }
]

export const TrendMetrics = () => {
  return (
    <div className='grid grid-cols-2 gap-2'>
      <MetricCard icon={<SCIcon icon={CalendarBlank} size='xs' color='#8896A7' />} label="Exam Goal" val="42" unit="Days Left" />
      <MetricCard icon={<SCIcon icon={CalendarBlank} size='xs' color='#8896A7' />} label="Sessions This Week" val="8" unit="Completed" />
      <MetricCard icon={<SCIcon icon={Timer} size='xs' color='#8896A7' />} label="Pacing" val="1.4" unit="Min/Q" />
      
      <Card className='border-[#D4DAE3] bg-white shadow-none p-3 flex flex-col justify-between h-[68px]'>
        <div className='flex flex-col gap-0.5'>
          <span className='text-[11px] font-bold uppercase tracking-wider flex items-center gap-1' style={{ color: '#8896A7' }}>
            <SCIcon icon={TrendUp} size='xs' className='text-primary' /> Weekly Trend
          </span>
          <div className='h-8 w-full -mt-1'>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SPARK_DATA}>
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                <Line 
                  type="monotone" 
                  dataKey="val" 
                  stroke="#1B3FC4" 
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
  <Card className='border-[#D4DAE3] bg-white shadow-none p-3 h-[68px]'>
    <div className='flex flex-col gap-0.5'>
      <span className='text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 leading-none' style={{ color: '#8896A7' }}>
        {icon} {label}
      </span>
      <div className='flex items-baseline gap-1 mt-1'>
        <span className='text-xl font-bold leading-none' style={{ color: '#1A2332' }}>{val}</span>
        <span className='text-[11px] font-medium uppercase tracking-tight leading-none' style={{ color: '#4A5568' }}>{unit}</span>
      </div>
    </div>
  </Card>
)
