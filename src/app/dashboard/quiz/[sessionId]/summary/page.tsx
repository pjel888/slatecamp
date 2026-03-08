import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  X,
  Clock,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Square,
} from 'lucide-react'
import Link from 'next/link'
import { generateSessionInsight } from '@/lib/actions/session-insights'
import { getReadinessScore } from '@/lib/actions/readiness'
import { ShareSection } from './share-section'
import type {
  ReviewSession,
  SessionQuestion,
  Question,
  Choice,
} from '@/types/app'

/** Normalize stored choice id (e.g. "a" or "Q11-A") to lowercase suffix for matching. */
function normalizeChoiceIds(value: string | null | undefined): Set<string> {
  if (!value?.trim()) return new Set()
  return new Set(
    value.split(',').map((s) => s.trim().replace(/^.*-/, '').toLowerCase()),
  )
}

/** Get normalized choice suffix for lookup (e.g. "Q4-A" → "a"). */
function choiceSuffix(choiceId: string): string {
  return choiceId.replace(/^.*-/, '').toLowerCase() || choiceId.toLowerCase()
}

export const metadata = { title: 'Session Summary — Cerebro' }

export default async function SessionSummaryPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('review_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) redirect('/dashboard')

  const s = session as ReviewSession

  const { data: sessionQuestions } = await supabase
    .from('session_questions')
    .select('*, questions(*)')
    .eq('session_id', sessionId)
    .order('question_number')

  const sqs = (sessionQuestions ?? []) as SessionQuestion[]

  const totalTimeMinutes = Math.round((s.total_time_ms ?? 0) / 60000)
  const avgTimeSeconds = s.avg_response_time_ms
    ? Math.round(s.avg_response_time_ms / 1000)
    : 0
  const scorePct = s.score_percentage ?? 0

  const examProfileId = s.exam_profile_id
  const [insight, readinessData] = await Promise.all([
    examProfileId
      ? generateSessionInsight(sessionId, examProfileId)
      : Promise.resolve('Every question makes you stronger.'),
    examProfileId ? getReadinessScore(examProfileId) : Promise.resolve(null),
  ])

  const { data: examProfile } = examProfileId
    ? await supabase
        .from('exam_profiles')
        .select('board_exams(short_name)')
        .eq('id', examProfileId)
        .single()
    : { data: null }
  const examProfileName =
    (examProfile as { board_exams?: { short_name: string } | null } | null)
      ?.board_exams?.short_name ?? 'ALE'
  const sessionLabel = 'Architecture Licensure Exam — Practice Session'

  return (
    <div className='mx-auto max-w-[720px] space-y-6'>
      {/* Score */}
      <div className='text-center'>
        <div className='inline-flex h-28 w-28 items-center justify-center rounded-full border-4 border-accent-blue'>
          <span className='text-4xl font-bold font-mono text-foreground'>
            {Math.round(scorePct)}%
          </span>
        </div>
        <p className='mt-3 text-lg font-semibold text-foreground'>
          {scorePct >= 80
            ? 'Excellent!'
            : scorePct >= 60
              ? 'Good job!'
              : 'Keep practicing!'}
        </p>
        <p className='mt-1 text-sm text-muted-foreground'>
          {s.questions_correct}/{s.total_questions} correct
        </p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-3'>
        <Card>
          <CardContent className='p-4 text-center'>
            <Check className='mx-auto h-5 w-5 text-success' strokeWidth={1.5} />
            <p className='mt-1 text-2xl font-semibold font-mono text-foreground'>
              {s.questions_correct}
            </p>
            <p className='text-xs text-muted-foreground'>Correct</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <X className='mx-auto h-5 w-5 text-danger' strokeWidth={1.5} />
            <p className='mt-1 text-2xl font-semibold font-mono text-foreground'>
              {s.questions_incorrect}
            </p>
            <p className='text-xs text-muted-foreground'>Wrong</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <Clock
              className='mx-auto h-5 w-5 text-muted-foreground'
              strokeWidth={1.5}
            />
            <p className='mt-1 text-2xl font-semibold font-mono text-foreground'>
              {totalTimeMinutes}m
            </p>
            <p className='text-xs text-muted-foreground'>
              ~{avgTimeSeconds}s/Q
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Auto-generated insight */}
      <p className='text-center text-sm text-muted-foreground'>{insight}</p>

      {/* Share your result */}
      <ShareSection
        scorePct={scorePct}
        sessionLabel={sessionLabel}
        subjectScores={s.subject_scores ?? []}
        insight={insight}
        readinessScore={readinessData?.score ?? null}
        examProfileName={examProfileName}
      />

      {/* Subject Breakdown */}
      {s.subject_scores?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-sm'>Subject Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {s.subject_scores.map((ss) => (
                <div
                  key={ss.subject_id}
                  className='flex items-center justify-between'
                >
                  <span className='text-sm text-foreground'>
                    {ss.subject_name}
                  </span>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-muted-foreground'>
                      {ss.correct}/{ss.total}
                    </span>
                    <Badge
                      variant={
                        ss.percentage >= 80
                          ? 'default'
                          : ss.percentage >= 60
                            ? 'secondary'
                            : 'destructive'
                      }
                      className='text-xs font-mono'
                    >
                      {Math.round(ss.percentage)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Review — always show all questions so the user can review their answers */}
      {sqs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-sm'>
              Question Review ({sqs.length})
            </CardTitle>
            <p className='text-xs text-muted-foreground'>
              Review each question, the options, and your answer.
            </p>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {sqs.map((sq, index) => {
                const q = sq.questions as Question | undefined
                const choices = (q?.choices as Choice[] | null) ?? []
                const selectedIds = normalizeChoiceIds(sq.selected_answer)
                const correctIds = normalizeChoiceIds(q?.correct_answer)
                const isCorrect = sq.is_correct === true
                return (
                  <div
                    key={sq.id}
                    className={`rounded-lg border p-4 ${
                      isCorrect ? 'border-border' : 'border-color-signal-red/40'
                    }`}
                  >
                    <div className='mb-2'>
                      <span className='text-xs font-mono text-muted-foreground'>
                        Question {index + 1}
                      </span>
                    </div>
                    <p className='text-sm font-medium text-foreground'>
                      {q?.prompt}
                    </p>
                    <p className='mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                      Options
                    </p>
                    <ul className='mt-2 space-y-2'>
                      {choices.map((choice) => (
                        <li
                          key={choice.id}
                          className='flex items-start gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5'
                        >
                          {q?.is_multi_select ? (
                            <Square
                              className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground'
                              strokeWidth={2}
                              aria-hidden
                            />
                          ) : (
                            <Circle
                              className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground'
                              strokeWidth={2}
                              aria-hidden
                            />
                          )}
                          <span className='mt-0.5 shrink-0 text-xs font-mono text-muted-foreground'>
                            {choice.id.toUpperCase().replace(/^.*-/, '')}.
                          </span>
                          <span className='min-w-0 flex-1 text-sm text-foreground'>
                            {choice.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Horizontal line then two columns: Your answer | Correct answer */}
                    <div className='mt-3 border-t border-border pt-3'>
                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        {(() => {
                          const userChoices = choices.filter((c) =>
                            selectedIds.has(choiceSuffix(c.id)),
                          )
                          const correctChoices = choices.filter((c) =>
                            correctIds.has(choiceSuffix(c.id)),
                          )
                          const userItems = userChoices.map((c) => ({
                            letter: c.id.replace(/^.*-/, '').toUpperCase(),
                            text: c.text,
                          }))
                          const correctItems = correctChoices.map((c) => ({
                            letter: c.id.replace(/^.*-/, '').toUpperCase(),
                            text: c.text,
                          }))
                          const renderAnswer = (
                            items: { letter: string; text: string }[],
                            colorClass: string,
                            forceBullets?: boolean,
                          ) => {
                            if (items.length === 0) return <span className='text-sm'>—</span>
                            if (items.length === 1 && !forceBullets) {
                              return (
                                <span className={`text-sm ${colorClass}`}>
                                  {items[0].letter}. {items[0].text}
                                </span>
                              )
                            }
                            return (
                              <ul className='mt-1 list-disc space-y-0.5 pl-4'>
                                {items.map((item) => (
                                  <li
                                    key={item.letter}
                                    className={`text-sm ${colorClass}`}
                                  >
                                    {item.letter}. {item.text}
                                  </li>
                                ))}
                              </ul>
                            )
                          }
                          const useBulletsForYourAnswer = correctItems.length > 1
                          return (
                            <>
                              <div
                                className={`rounded-lg border px-3 py-2.5 ${
                                  isCorrect
                                    ? 'border-(--color-signal-green) bg-signal-green/10'
                                    : 'border-(--color-signal-red) bg-signal-red/10'
                                }`}
                              >
                                <div className='flex flex-wrap items-center gap-2'>
                                  <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>
                                    Your answer
                                  </p>
                                  {isCorrect ? (
                                    <Badge className='bg-(--color-signal-green) text-[10px] text-white hover:bg-(--color-signal-green)'>
                                      <CheckCircle2
                                        className='mr-0.5 h-3 w-3'
                                        strokeWidth={1.5}
                                      />
                                      Correct
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant='destructive'
                                      className='text-[10px]'
                                    >
                                      Incorrect
                                    </Badge>
                                  )}
                                </div>
                                <div className='mt-1'>
                                  {renderAnswer(
                                    userItems,
                                    isCorrect
                                      ? 'text-(--color-signal-green)'
                                      : 'text-(--color-signal-red)',
                                    useBulletsForYourAnswer,
                                  )}
                                </div>
                              </div>
                              <div className='rounded-lg border border-(--color-signal-green) bg-signal-green/10 px-3 py-2.5'>
                                <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>
                                  Correct answer
                                </p>
                                <div className='mt-1'>
                                  {renderAnswer(
                                    correctItems,
                                    'text-(--color-signal-green)',
                                  )}
                                </div>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                    {q?.explanation && (
                      <div className='mt-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2'>
                        <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>
                          Explanation
                        </p>
                        <p className='mt-1 text-sm text-foreground'>
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className='flex flex-col gap-3 sm:flex-row'>
        <Link href='/dashboard' className='flex-1'>
          <Button variant='outline' className='w-full gap-2'>
            <ArrowLeft className='h-4 w-4' strokeWidth={1.5} />
            Dashboard
          </Button>
        </Link>
        <Link href='/dashboard/sessions' className='flex-1'>
          <Button variant='outline' className='w-full gap-2'>
            Sessions
            <ChevronRight className='h-4 w-4' strokeWidth={1.5} />
          </Button>
        </Link>
      </div>
    </div>
  )
}
