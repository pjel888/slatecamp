'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type {
  AdminDesignProblemDetail,
  AdminDesignProblemQuestion,
} from '@/lib/actions/admin/design-problems'
import {
  createAdminDesignProblemQuestion,
  updateAdminDesignProblemQuestion,
} from '@/lib/actions/admin/design-problems'

interface DesignProblemEditorProps {
  problem: AdminDesignProblemDetail
}

const DesignProblemQuestionCard = ({
  question,
}: {
  question: AdminDesignProblemQuestion
}) => {
  const [draft, setDraft] = useState(question)
  const [isPending, startTransition] = useTransition()
  const [savedMessage, setSavedMessage] = useState('')

  const updateOption = (index: number, value: string) => {
    const nextOptions = [...draft.options]
    nextOptions[index] = value
    setDraft({ ...draft, options: nextOptions })
  }

  const handleSave = () => {
    startTransition(async () => {
      await updateAdminDesignProblemQuestion(question.question_id, draft)
      setSavedMessage('Saved')
      setTimeout(() => setSavedMessage(''), 1500)
    })
  }

  return (
    <Card size="md" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-mono text-muted-foreground">Question {draft.number}</p>
          <p className="text-sm font-semibold text-foreground">{draft.type || 'Design Problem Question'}</p>
        </div>
        <div className="flex items-center gap-2">
          {savedMessage && <span className="text-xs text-emerald-600">{savedMessage}</span>}
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Question type</label>
          <Input
            value={draft.type || ''}
            onChange={(event) => setDraft({ ...draft, type: event.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Stem</label>
          <Textarea
            value={draft.question_stem}
            onChange={(event) => setDraft({ ...draft, question_stem: event.target.value })}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {draft.options.map((option, index) => (
            <div key={`${draft.question_id}-option-${index}`} className="space-y-1">
              <label className="block text-xs font-medium text-muted-foreground">
                Option {String.fromCharCode(65 + index)}
              </label>
              <Input value={option} onChange={(event) => updateOption(index, event.target.value)} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Correct answer index</label>
            <Input
              type="number"
              value={draft.correct_answer_index}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  correct_answer_index: Number(event.target.value) || 0,
                })
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Code citation</label>
            <Input
              value={draft.code_citation || ''}
              onChange={(event) => setDraft({ ...draft, code_citation: event.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Solution steps</label>
          <Textarea
            value={draft.solution_steps.join('\n')}
            onChange={(event) =>
              setDraft({
                ...draft,
                solution_steps: event.target.value
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean),
              })
            }
            rows={3}
          />
        </div>
      </div>
    </Card>
  )
}

export const DesignProblemEditor = ({ problem }: DesignProblemEditorProps) => {
  const [questions, setQuestions] = useState(problem.questions)
  const [isCreating, startCreating] = useTransition()

  const handleAddQuestion = () => {
    startCreating(async () => {
      const result = await createAdminDesignProblemQuestion(problem.problem_id)
      setQuestions((prev) => [
        ...prev,
        {
          question_id: result.questionId,
          problem_id: problem.problem_id,
          number: prev.length + 1,
          type: 'DC',
          question_stem: 'New design problem question',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correct_answer_index: 0,
          rationale: {},
          solution_steps: [],
          code_citation: null,
        },
      ])
    })
  }

  return (
    <div className="space-y-6">
      <Card size="md">
        <div className="space-y-2">
          <p className="text-xs font-mono text-muted-foreground">{problem.problem_id}</p>
          <h1 className="text-xl font-semibold text-foreground">{problem.title}</h1>
          <p className="text-sm text-muted-foreground">{problem.brief}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{problem.building_type}</span>
            <span>Difficulty {problem.difficulty ?? 'N/A'}</span>
            <span>{problem.time_limit_minutes || 180} min</span>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Design Problem Questions</h2>
        <Button size="sm" onClick={handleAddQuestion} disabled={isCreating}>
          {isCreating ? 'Adding...' : 'Add Design Problem Question'}
        </Button>
      </div>

      <div className="space-y-4">
        {questions.map((question) => (
          <DesignProblemQuestionCard key={question.question_id} question={question} />
        ))}
      </div>
    </div>
  )
}
