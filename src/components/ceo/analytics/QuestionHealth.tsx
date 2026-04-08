'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { QuestionHealthRow } from '@/lib/queries/ceo/analytics/get-question-health'

interface Props {
  questions: QuestionHealthRow[]
}

const flagVariant = (flag: string): 'destructive' | 'secondary' | 'outline' => {
  if (flag === 'Too Hard') return 'destructive'
  if (flag === 'Confusing') return 'secondary'
  return 'outline'
}

const formatTime = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

export const QuestionHealth = ({ questions }: Props) => {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
            Flagged Questions
          </CardTitle>
          <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
            {questions.length} flagged
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div
          className="h-[400px] overflow-y-auto"
          role="region"
          aria-label="Question health analysis table flagging problematic questions"
        >
          {/* Header row */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 gap-y-0 mb-2 px-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Question ID
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">
              Attempts
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">
              Accuracy
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">
              Avg Time
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">
              Flags
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {questions.map((q) => (
              <div
                key={q.questionId}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 items-center px-2 py-1.5 rounded-sm hover:bg-muted/40 transition-colors duration-150"
              >
                <span
                  className="text-xs font-mono text-foreground truncate max-w-[160px]"
                  title={q.questionId}
                >
                  {q.questionId.slice(0, 8)}…
                </span>
                <span className="text-xs font-mono tabular-nums text-muted-foreground text-right">
                  {q.totalAttempts.toLocaleString()}
                </span>
                <span
                  className={`text-xs font-mono tabular-nums text-right ${
                    q.accuracy < 20
                      ? 'text-destructive'
                      : q.accuracy > 95
                        ? 'text-warning'
                        : 'text-foreground'
                  }`}
                >
                  {q.accuracy}%
                </span>
                <span
                  className={`text-xs font-mono tabular-nums text-right ${
                    q.avgTimeMs > 180_000 ? 'text-destructive' : 'text-muted-foreground'
                  }`}
                >
                  {formatTime(q.avgTimeMs)}
                </span>
                <div className="flex gap-1 justify-end flex-wrap">
                  {q.flags.map((flag) => (
                    <Badge key={flag} variant={flagVariant(flag)} className="text-[9px] px-1 py-0">
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
