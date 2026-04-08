'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveContainer, LineChart, Line } from 'recharts'
import { useChartColors } from '@/hooks/useChartColors'
import type { MasterySparklineItem } from '@/lib/actions/analytics/get-mastery-history'

interface Props {
  data: MasterySparklineItem[]
}

export const MasterySparklineGrid = ({ data }: Props) => {
  const colors = useChartColors()

  return (
    <Card className="border-border bg-card p-2 relative h-full">
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Mastery History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" role="img" aria-label="Grid of mastery sparkline charts per topic showing mastery percentage over time">
          {data.map(item => (
            <div key={item.topicId} className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground truncate" title={item.topicName}>
                {item.topicName}
              </span>
              <div className="h-[48px]">
                <ResponsiveContainer width="100%" height={48}>
                  <LineChart data={item.points} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                    <Line
                      dataKey="mastery"
                      stroke={colors.primary}
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <span className="text-[10px] font-medium text-foreground">
                {item.points[item.points.length - 1]?.mastery ?? 0}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
