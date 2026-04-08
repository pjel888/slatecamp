'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { reportExamOutcome } from '@/lib/actions/progress-report/actions'

interface Props {
  targetExamDate: string | null
}

export const ExamOutcomeForm = ({ targetExamDate }: Props) => {
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [examDate, setExamDate] = useState('')
  const [result, setResult] = useState<'pass' | 'fail'>('pass')
  const [score, setScore] = useState('')

  // Show informational message if exam date is in the future
  if (targetExamDate) {
    const examDateObj = new Date(targetExamDate)
    if (examDateObj.getTime() > Date.now()) {
      const formatDate = (d: Date) =>
        d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      return (
        <Card className="h-[280px] border-border/50">
          <CardContent className="flex flex-col items-center justify-center h-full gap-2 p-4 text-center">
            <p className="text-sm font-medium text-foreground">
              Your exam is on {formatDate(examDateObj)}.
            </p>
            <p className="text-xs text-muted-foreground">
              After the exam, you can report your result here.
            </p>
          </CardContent>
        </Card>
      )
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!examDate) {
      setError('Please select your exam date.')
      return
    }

    startTransition(async () => {
      const examDateObj = new Date(examDate)
      const batch = `${examDateObj.getFullYear()}-${String(examDateObj.getMonth() + 1).padStart(2, '0')}`

      const res = await reportExamOutcome({
        examDate,
        result,
        selfReportedScore: score ? parseFloat(score) : null,
        examBatch: batch,
      })

      if (res.success) {
        setSubmitted(true)
      } else {
        setError(res.error ?? 'Something went wrong. Please try again.')
      }
    })
  }

  if (submitted) {
    return (
      <Card className="border-border bg-card p-2">
        <CardContent className="p-4 text-center">
          <p className="text-sm font-semibold text-success">
            Thank you for reporting your exam outcome.
          </p>
          <p className="text-xs text-text-secondary mt-1">
            This helps us improve our readiness predictions for everyone.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card p-2">
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Report Exam Outcome
        </CardTitle>
        <p className="text-xs text-text-secondary mt-0.5">
          Help us calibrate readiness predictions by sharing your result.
        </p>
      </CardHeader>
      <CardContent className="p-2 pt-1">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Exam Date */}
          <div>
            <label htmlFor="exam-date" className="block text-[11px] font-semibold text-text-secondary mb-1">
              Exam Date
            </label>
            <Input
              id="exam-date"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="rounded-sm text-sm"
            />
          </div>

          {/* Result Toggle */}
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              Result
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setResult('pass')}
                className={`flex-1 rounded-sm text-sm font-semibold transition-colors duration-150 ${
                  result === 'pass' ? 'bg-success text-white border-success hover:bg-success hover:text-white' : ''
                }`}
              >
                Passed
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setResult('fail')}
                className={`flex-1 rounded-sm text-sm font-semibold transition-colors duration-150 ${
                  result === 'fail' ? 'bg-destructive text-white border-destructive hover:bg-destructive hover:text-white' : ''
                }`}
              >
                Not Yet
              </Button>
            </div>
          </div>

          {/* Optional Score */}
          <div>
            <label htmlFor="exam-score" className="block text-[11px] font-semibold text-text-secondary mb-1">
              Score (optional)
            </label>
            <Input
              id="exam-score"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="e.g. 78.5"
              className="rounded-sm text-sm"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive-50 rounded-sm px-2 py-1">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="rounded-sm text-sm font-semibold"
          >
            {isPending ? 'Submitting...' : 'Submit Outcome'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
