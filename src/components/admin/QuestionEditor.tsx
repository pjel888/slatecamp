'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { createQuestion, updateQuestion, deleteQuestion } from '@/lib/actions/admin/questions'
import { FloppyDisk, XCircle, Trash, ArrowLeft, MagnifyingGlass, Check } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import Link from 'next/link'
import {
  Modal as Dialog,
  ModalContent as DialogContent,
  ModalHeader as DialogHeader,
  ModalTitle as DialogTitle,
  ModalDescription as DialogDescription,
  ModalFooter as DialogFooter,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { toast } from '@/lib/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { TaxonomyNodeInfo } from './unified-editor/types'

interface QuestionEditorProps {
  readOnly?: boolean
  taxonomyNodes?: TaxonomyNodeInfo[]
  topicArticles?: Array<{
    topicId: string
    articleId: string
    articleTitle?: string | null
    articleStatus?: string | null
  }>
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

export const QuestionEditor = ({
  question,
  readOnly = false,
  taxonomyNodes = [],
  topicArticles = [],
}: QuestionEditorProps) => {
  const router = useRouter()
  const topicArticleMap = useMemo(
    () =>
      new Map(
        topicArticles.map((entry) => [
          entry.topicId,
          {
            articleId: entry.articleId,
            articleTitle: entry.articleTitle ?? null,
            articleStatus: entry.articleStatus ?? null,
          },
        ]),
      ),
    [topicArticles],
  )

  const [text, setText] = useState(question?.text || '')
  const [topicId, setTopicId] = useState(question?.topic_id || '')
  const [articleId, setArticleId] = useState(
    question?.article_id || (question?.topic_id ? topicArticleMap.get(question.topic_id)?.articleId || '' : ''),
  )
  const questionType = question?.question_type || 'mcq'
  
  // Taxonomy Search
  const [taxSearch, setTaxSearch] = useState('')
  const filteredNodes = useMemo(() => {
    return taxonomyNodes
      .filter(n => n.level >= 2) // Subjects and Topics
      .filter(n => !taxSearch || n.name.toLowerCase().includes(taxSearch.toLowerCase()) || (n.lea_id && n.lea_id.toLowerCase().includes(taxSearch.toLowerCase())))
      .slice(0, 100)
  }, [taxonomyNodes, taxSearch])

  const selectedNode = useMemo(() => taxonomyNodes.find(n => n.node_id === topicId), [taxonomyNodes, topicId])

  // Normalize options to string[]
  const [options, setOptions] = useState<string[]>(() => {
    if (!question?.options) return ['', '', '', '']
    return (question.options as any[]).map(opt => typeof opt === 'string' ? opt : opt.text)
  })

  const [correctAnswer, setCorrectAnswer] = useState(question?.correct_option_id || 'A')
  const linkedArticle = useMemo(
    () => (topicId ? topicArticleMap.get(topicId) ?? null : null),
    [topicArticleMap, topicId],
  )

  const [rationale, setRationale] = useState(() => {
    if (typeof question?.rationale === 'object' && question.rationale !== null) {
      return (question.rationale as any).text || JSON.stringify(question.rationale)
    }
    return question?.rationale || ''
  })
  const [difficulty, setDifficulty] = useState(question?.difficulty || 0.5)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const optionLabels = ['A', 'B', 'C', 'D']

  useEffect(() => {
    if (question?.topic_id) {
      setTopicId(question.topic_id)
    }

    if (question?.article_id) {
      setArticleId(question.article_id)
      return
    }

    if (!question?.id) {
      setArticleId(linkedArticle?.articleId ?? '')
    }
  }, [linkedArticle, question?.article_id, question?.id, question?.topic_id])

  const handleSelectTopic = (nodeId: string) => {
    setTopicId(nodeId)
    if (!question?.id) {
      setArticleId(topicArticleMap.get(nodeId)?.articleId ?? '')
    }
  }

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
        toast({
          title: 'Question updated',
          description: 'The assessment item has been saved successfully.',
          variant: 'success'
        })
      } else {
        const { error } = await createQuestion(data)
        if (error) throw error
        toast({
          title: 'Question created',
          description: 'A new assessment item has been added to the bank.',
          variant: 'success'
        })
      }

      router.push(ROUTES.admin.knowledgeQuestions)
      router.refresh()
    } catch (err) {
      console.error('Error saving question:', err)
      setErrorMessage('Failed to save question. Please try again.')
      toast({
        title: 'Save failed',
        description: err instanceof Error ? err.message : 'An error occurred while saving.',
        variant: 'error'
      })
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

      toast({
        title: 'Question deleted',
        description: 'The assessment item has been removed.',
        variant: 'success'
      })

      router.push(ROUTES.admin.knowledgeQuestions)
      router.refresh()
    } catch (err) {
      console.error('Error deleting question:', err)
      setErrorMessage('Failed to delete question. Please try again.')
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'An error occurred while deleting.',
        variant: 'error'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex gap-6 items-start">
      {/* LEFT: Form */}
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href={ROUTES.admin.knowledgeQuestions}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            <SCIcon icon={ArrowLeft} size="sm" />
            Back to Questions
          </Link>
          {question?.id && !readOnly && (
            <button
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
              className="flex items-center gap-2 text-destructive hover:text-destructive/80 transition-colors duration-150 text-sm font-medium"
            >
              <SCIcon icon={Trash} size="sm" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="px-4 py-3 rounded-md bg-destructive-50 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">
            {errorMessage}
          </div>
        )}

        {questionType !== 'mcq' && (
          <div className="px-4 py-3 rounded-md bg-warning-50 border border-warning/20 text-warning-700 text-sm">
            This question uses the `{questionType}` type and must be handled in a dedicated exception workflow. The standard question editor is read-only for this type.
          </div>
        )}

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Question Text */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-text-tertiary mb-2">Question Stem *</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                readOnly={readOnly || questionType !== 'mcq'}
                placeholder="Enter your question here..."
                rows={6}
                className="w-full px-3 py-2 rounded-sm border border-border bg-card text-sm text-text-primary placeholder:text-text-tertiary focus:border-camp-cobalt focus:ring-2 focus:ring-camp-cobalt/10 outline-none transition-all duration-150 resize-none"
              />
            </div>

            {/* Rationale */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-text-tertiary mb-2">Rationale</label>
              <textarea
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                readOnly={readOnly || questionType !== 'mcq'}
                placeholder="Explain why the correct answer is correct..."
                rows={4}
                className="w-full px-3 py-2 rounded-sm border border-border bg-card text-sm text-text-primary placeholder:text-text-tertiary focus:border-camp-cobalt focus:ring-2 focus:ring-camp-cobalt/10 outline-none transition-all duration-150 resize-none"
              />
            </div>

            {/* Difficulty */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-mono uppercase tracking-widest text-text-tertiary">Difficulty</label>
                <span className="text-xs font-medium text-text-secondary">{Math.round(difficulty * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                disabled={readOnly || questionType !== 'mcq'}
                className="w-full accent-camp-cobalt"
              />
              <div className="flex justify-between text-[10px] text-text-tertiary mt-1 font-medium">
                <span>EASY</span>
                <span>NEUTRAL</span>
                <span>HARD</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Taxonomy Selector (Improved) */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-text-tertiary mb-2">Taxonomy Topic *</label>
              <div className="space-y-2">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
                  <input
                    type="text"
                    placeholder="Search topics..."
                    value={taxSearch}
                    onChange={e => setTaxSearch(e.target.value)}
                    disabled={readOnly || questionType !== 'mcq'}
                    className="w-full pl-8 pr-3 py-1.5 rounded-sm border border-border bg-card text-xs text-text-primary focus:border-camp-cobalt focus:outline-none transition-colors"
                  />
                </div>
                <div className="max-h-[180px] overflow-y-auto rounded-sm border border-border bg-surface-light p-1">
                  {filteredNodes.length === 0 ? (
                    <p className="p-3 text-center text-[11px] text-text-tertiary">No matching topics found</p>
                  ) : (
                    filteredNodes.map(node => (
                      <button
                        key={node.node_id}
                        type="button"
                      onClick={() => handleSelectTopic(node.node_id)}
                        disabled={readOnly || questionType !== 'mcq'}
                        className={cn(
                          "w-full text-left px-2 py-1.5 rounded-sm text-[11px] transition-colors flex items-center justify-between",
                          topicId === node.node_id 
                            ? "bg-primary-50 text-camp-cobalt font-medium" 
                            : "hover:bg-white text-text-secondary"
                        )}
                      >
                        <span className="truncate flex-1">
                          {node.lea_id && <span className="font-mono mr-1.5 opacity-70">[{node.lea_id}]</span>}
                          {node.name}
                        </span>
                        {topicId === node.node_id && <Check className="w-3 h-3" />}
                      </button>
                    ))
                  )}
                </div>
                {selectedNode && (
                  <div className="px-2 py-1 bg-primary-50 rounded-sm border border-primary/10 flex items-center justify-between">
                    <span className="text-[10px] text-camp-cobalt font-medium uppercase tracking-tight">
                      Selected: {selectedNode.name}
                    </span>
                    <span className="text-[9px] font-mono text-camp-cobalt/60 truncate ml-2">
                      {selectedNode.node_id}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-text-tertiary mb-2">Linked Article</label>
              <div className="px-3 py-2 rounded-sm border border-border bg-muted/30 flex items-center justify-between">
                <div className="min-w-0">
                  <span className="block text-xs text-text-secondary truncate">
                    {linkedArticle?.articleTitle || articleId || 'No article linked'}
                  </span>
                  {articleId ? (
                    <span className="block text-[10px] font-mono text-text-tertiary truncate mt-0.5">
                      {articleId}
                    </span>
                  ) : null}
                </div>
                {articleId && (
                  <Link 
                    href={`/admin/knowledge/${articleId}`}
                    target="_blank"
                    className="text-[10px] font-bold text-camp-cobalt hover:underline flex-shrink-0"
                  >
                    VIEW &rarr;
                  </Link>
                )}
              </div>
              <p className="text-[10px] text-text-tertiary mt-1.5 leading-relaxed">
                {articleId
                  ? 'Standard questions remain directly linked to their owning article. Publication checks apply at delivery time.'
                  : 'Choose a topic with a primary article mapping before saving this question.'}
              </p>
            </div>

            {/* Options */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-text-tertiary mb-3">Answer Options *</label>
              <div className="space-y-2.5">
                {options.slice(0, 4).map((option, index) => (
                  <div key={index} className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-sm border transition-all duration-150",
                    correctAnswer === optionLabels[index] 
                      ? "border-emerald/30 bg-success-50/30" 
                      : "border-border bg-card"
                  )}>
                    <label className="flex cursor-pointer items-center justify-center w-6">
                      <input
                        type="radio"
                        name="correct-answer"
                        checked={correctAnswer === optionLabels[index]}
                        onChange={() => setCorrectAnswer(optionLabels[index])}
                        disabled={readOnly || questionType !== 'mcq'}
                        className="h-3.5 w-3.5 accent-emerald cursor-pointer"
                      />
                    </label>
                    <span className={cn(
                      "w-4 font-mono text-xs font-bold",
                      correctAnswer === optionLabels[index] ? "text-emerald" : "text-text-tertiary"
                    )}>
                      {optionLabels[index]}
                    </span>
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
                      className="flex-1 bg-transparent border-none text-sm text-text-primary placeholder:text-text-tertiary outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex gap-3 pt-6 border-t border-border mt-4">
          <Link
            href={ROUTES.admin.knowledgeQuestions}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm border border-border text-text-secondary hover:bg-surface-light transition-colors duration-150 text-sm font-medium"
          >
            <SCIcon icon={XCircle} size="sm" />
            Cancel
          </Link>
          {!readOnly ? (
            <button
              onClick={handleSave}
              disabled={isSaving || questionType !== 'mcq'}
              className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm bg-camp-cobalt text-white hover:bg-primary-700 disabled:opacity-50 transition-all duration-150 text-sm font-bold shadow-sm active:scale-[0.98]"
            >
              <SCIcon icon={FloppyDisk} size="sm" />
              {isSaving ? 'Saving...' : question?.id ? 'SAVE CHANGES' : 'CREATE QUESTION'}
            </button>
          ) : null}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Question</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this question? This action cannot be undone and will remove it from all assessments.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} size="sm">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} size="sm">
                Delete Question
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
