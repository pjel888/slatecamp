'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { createQuestion, updateQuestion, deleteQuestion } from '@/lib/actions/admin/questions'
import { FloppyDisk, XCircle, Trash, ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface QuestionEditorProps {
  readOnly?: boolean
  question?: {
    id: string
    text: string
    topic_id: string
    article_id?: string | null
    question_type?: string | null
    options: string[] | { text: string; is_correct?: boolean }[]
    correct_option_id: string
    rationale: string | null
    difficulty: number
    code_citation?: string | null
  }
}

export const QuestionEditor = ({ question, readOnly = false }: QuestionEditorProps) => {
  const router = useRouter()

  const [text, setText] = useState(question?.text || '')
  const [topicId, setTopicId] = useState(question?.topic_id || '')
  const [articleId] = useState(question?.article_id || '')
  const questionType = question?.question_type || 'mcq'
  
  // Normalize options to string[]
  const [options, setOptions] = useState<string[]>(() => {
    if (!question?.options) return ['', '', '', '']
    return question.options.map(opt => typeof opt === 'string' ? opt : opt.text)
  })

  const [correctAnswer, setCorrectAnswer] = useState(question?.correct_option_id || 'A')

  const [rationale, setRationale] = useState(() => {
    if (typeof question?.rationale === 'object' && question.rationale !== null) {
      return (question.rationale as any).text || JSON.stringify(question.rationale)
    }
    return question?.rationale || ''
  })
  const [difficulty, setDifficulty] = useState(question?.difficulty || 3)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const optionLabels = ['A', 'B', 'C', 'D']

  const handleSave = async () => {
    setErrorMessage(null)

    if (!text.trim() || !topicId.trim() || options.some(o => !o.trim())) {
      setErrorMessage('Please fill in all required fields')
      return
    }

    if (!articleId.trim()) {
      setErrorMessage('Standard questions must remain directly linked to an article before they can be saved.')
      return
    }

    setIsSaving(true)
    try {
      const data = {
        text: text.trim(),
        topic_id: topicId.trim(),
        article_id: articleId.trim(),
        options: options.slice(0, 4).map((optText, i) => ({
          id: optionLabels[i],
          text: optText.trim(),
          is_correct: optionLabels[i] === correctAnswer,
        })),
        correct_option_id: correctAnswer,
        rationale: rationale.trim() || undefined,
        difficulty,
      }

      if (question?.id) {
        const { error } = await updateQuestion(question.id, data)
        if (error) throw error
      } else {
        const { error } = await createQuestion(data)
        if (error) throw error
      }

      router.push(ROUTES.admin.knowledgeQuestions)
      router.refresh()
    } catch (err) {
      console.error('Error saving question:', err)
      setErrorMessage('Failed to save question. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!question?.id) return

    setIsDeleting(true)
    setShowDeleteDialog(false)
    try {
      const { error } = await deleteQuestion(question.id)
      if (error) throw error

      router.push(ROUTES.admin.knowledgeQuestions)
      router.refresh()
    } catch (err) {
      console.error('Error deleting question:', err)
      setErrorMessage('Failed to delete question. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex gap-6 items-start">
      {/* LEFT: Form */}
      <div className="w-1/2 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href={ROUTES.admin.knowledgeQuestions}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <SCIcon icon={ArrowLeft} size="sm" />
            Back to Questions
          </Link>
          {question?.id && !readOnly && (
            <button
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <SCIcon icon={Trash} size="sm" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="px-4 py-3 rounded-md bg-destructive-50 border border-destructive text-destructive text-sm">
            {errorMessage}
          </div>
        )}

        {questionType !== 'mcq' && (
          <div className="px-4 py-3 rounded-md bg-warning-50 border border-warning text-warning text-sm">
            This question uses the `{questionType}` type and must be handled in a dedicated exception workflow. The standard question editor is read-only for this type.
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium mb-2">Question Text *</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              readOnly={readOnly || questionType !== 'mcq'}
              placeholder="Enter your question here..."
              rows={4}
              className="w-full px-3 py-2 rounded-md border border-input bg-background resize-none"
            />
          </div>

          {/* Taxonomy Node */}
          <div>
            <label className="block text-sm font-medium mb-2">Taxonomy Node ID *</label>
            <input
              type="text"
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              readOnly={readOnly || questionType !== 'mcq'}
              placeholder="Enter taxonomy node UUID..."
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The UUID of the taxonomy node this question belongs to
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Linked Article</label>
            <input
              type="text"
              value={articleId}
              readOnly
              className="w-full px-3 py-2 rounded-md border border-input bg-muted text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Standard questions must remain directly linked to their owning article. Publication checks apply at delivery time.
            </p>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium mb-2">Answer Options *</label>
            <div className="space-y-3">
              {options.slice(0, 4).map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="correct-answer"
                    checked={correctAnswer === optionLabels[index]}
                    onChange={() => setCorrectAnswer(optionLabels[index])}
                    disabled={readOnly || questionType !== 'mcq'}
                    className="h-4 w-4"
                  />
                  <span className="w-8 font-medium">{optionLabels[index]}</span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      if (readOnly || questionType !== 'mcq') return
                      const newOptions = [...options]
                      newOptions[index] = e.target.value
                      setOptions(newOptions)
                    }}
                    readOnly={readOnly || questionType !== 'mcq'}
                    placeholder={`Option ${optionLabels[index]}...`}
                    className="flex-1 px-3 py-2 rounded-md border border-input bg-background"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Rationale */}
          <div>
            <label className="block text-sm font-medium mb-2">Rationale</label>
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              readOnly={readOnly || questionType !== 'mcq'}
              placeholder="Explain why the correct answer is correct..."
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-input bg-background resize-none"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium mb-2">Difficulty</label>
            <input
              type="range"
              min="1"
              max="5"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              disabled={readOnly || questionType !== 'mcq'}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Very Easy (1)</span>
              <span>Very Hard (5)</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <Link
            href={ROUTES.admin.knowledgeQuestions}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-input hover:bg-muted"
          >
            <SCIcon icon={XCircle} size="sm" />
            Cancel
          </Link>
          {!readOnly ? (
            <button
              onClick={handleSave}
              disabled={isSaving || questionType !== 'mcq'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <SCIcon icon={FloppyDisk} size="sm" />
              {isSaving ? 'Saving...' : question?.id ? 'Update Question' : 'Create Question'}
            </button>
          ) : null}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Question</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this question? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
