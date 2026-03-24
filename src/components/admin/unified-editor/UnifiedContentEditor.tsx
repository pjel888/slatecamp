'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DirtyStateProvider, useDirtyState } from './DirtyStateProvider'
import { ContentBar } from './ContentBar'
import { OutlinePanel } from './OutlinePanel'
import { ArticlePanel } from './ArticlePanel'
import { QuestionsPanel } from './QuestionsPanel'
import { SaveAllBar } from './SaveAllBar'
import { PanelErrorBoundary } from './PanelErrorBoundary'
import type {
  ArticleData,
  QuestionData,
  EIPromptData,
  TaxonomyNodeInfo,
  TaxonomyLink,
  ParsedHeading,
} from './types'

// ─── Props ───────────────────────────────────────────────────

interface UnifiedContentEditorProps {
  article: ArticleData
  questions: QuestionData[]
  eiPrompts: EIPromptData[]
  taxonomyNodes: TaxonomyNodeInfo[]
  taxonomyLinks: TaxonomyLink[]
}

// ─── Inner Component (needs DirtyState context) ──────────────

const EditorInner = ({
  article: initialArticle,
  questions: initialQuestions,
  eiPrompts: initialEIPrompts,
  taxonomyNodes,
  taxonomyLinks,
}: UnifiedContentEditorProps) => {
  const router = useRouter()
  const dirty = useDirtyState()

  // ── Article state ────────────────────────────────────────
  const [title, setTitle] = useState(initialArticle.title)
  const [content, setContent] = useState(initialArticle.content)
  const [status, setStatus] = useState(initialArticle.status || 'draft')
  const [difficultyLabel, setDifficultyLabel] = useState(
    initialArticle.difficulty_label || ''
  )
  const [aleTestsYou, setAleTestsYou] = useState(
    initialArticle.ale_tests_you || ''
  )
  const [updatedNote, setUpdatedNote] = useState(
    initialArticle.updated_note || ''
  )
  const [subjectLabel, setSubjectLabel] = useState(
    initialArticle.subject_label || ''
  )
  const [reviewerComments, setReviewerComments] = useState(
    initialArticle.reviewer_comments || ''
  )

  // ── Questions state ──────────────────────────────────────
  const [questions, setQuestions] = useState<QuestionData[]>(initialQuestions)

  // ── EI Prompts state ─────────────────────────────────────
  const [eiPrompts, setEIPrompts] = useState<EIPromptData[]>(initialEIPrompts)

  // ── Parsed headings (from article content) ───────────────
  const [headings, setHeadings] = useState<ParsedHeading[]>([])

  // ── Save state ───────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // ── Refs ─────────────────────────────────────────────────
  const editorViewRef = useRef<any>(null)

  // ── Article field change handlers ────────────────────────
  const handleTitleChange = useCallback(
    (val: string) => {
      setTitle(val)
      dirty.markArticleDirty()
    },
    [dirty]
  )

  const handleContentChange = useCallback(
    (val: string) => {
      setContent(val)
      dirty.markArticleDirty()
    },
    [dirty]
  )

  const handleStatusChange = useCallback(
    (val: string) => {
      setStatus(val)
      dirty.markArticleDirty()
    },
    [dirty]
  )

  const handleDifficultyLabelChange = useCallback(
    (val: string) => {
      setDifficultyLabel(val)
      dirty.markArticleDirty()
    },
    [dirty]
  )

  // ── Question update handler ──────────────────────────────
  const handleQuestionUpdate = useCallback(
    (questionId: string, data: Partial<QuestionData>) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.question_id === questionId ? { ...q, ...data } : q
        )
      )
      dirty.markQuestionDirty(questionId)
    },
    [dirty]
  )

  // ── EI Prompt update handler ─────────────────────────────
  const handleEIPromptUpdate = useCallback(
    (promptId: string, data: Partial<EIPromptData>) => {
      setEIPrompts((prev) =>
        prev.map((p) =>
          p.prompt_id === promptId ? { ...p, ...data } : p
        )
      )
      dirty.markEIPromptDirty(promptId)
    },
    [dirty]
  )

  // ── beforeunload warning ─────────────────────────────────
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty.isAnythingDirty) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty.isAnythingDirty])

  // ── Primary taxonomy node ────────────────────────────────
  const primaryLink = taxonomyLinks.find((l) => l.is_primary)
  const primaryNode = primaryLink
    ? taxonomyNodes.find((n) => n.node_id === primaryLink.node_id)
    : taxonomyNodes[0] || null

  const questionsCount =
    questions.length +
    dirty.newQuestions.length -
    dirty.deletedQuestions.size

  // ── Article data for save ────────────────────────────────
  const articleState = {
    article_id: initialArticle.article_id,
    title,
    content,
    status,
    difficulty_label: difficultyLabel || undefined,
    ale_tests_you: aleTestsYou || undefined,
    updated_note: updatedNote || undefined,
    subject_label: subjectLabel || undefined,
    reviewer_comments: reviewerComments || undefined,
    // Snapshot of updated_at when the page loaded — used for concurrent edit detection
    initial_updated_at: initialArticle.updated_at,
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-[#F8F7F5]">
      {/* Content Bar */}
      <ContentBar
        title={title}
        onTitleChange={handleTitleChange}
        aleId={primaryNode?.ale_id || null}
        status={status}
        onStatusChange={handleStatusChange}
        difficultyLabel={difficultyLabel}
        onDifficultyLabelChange={handleDifficultyLabelChange}
        questionsCount={questionsCount}
        isSaving={isSaving}
        saveError={saveError}
      />

      {/* Save Error Bar */}
      <SaveAllBar
        articleState={articleState}
        questions={questions}
        eiPrompts={eiPrompts}
        isSaving={isSaving}
        setIsSaving={setIsSaving}
        setSaveError={setSaveError}
        onSaveComplete={() => {
          router.refresh()
        }}
      />

      {/* Three-column layout — stacks vertically below xl */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden xl:flex-row">
        {/* Outline Panel — hidden below xl, 200px fixed on xl+ */}
        <div className="hidden xl:block">
          <PanelErrorBoundary panelName="Outline">
            <OutlinePanel
              headings={headings}
              questions={questions}
              eiPrompts={eiPrompts}
              editorViewRef={editorViewRef}
              content={content}
            />
          </PanelErrorBoundary>
        </div>

        {/* Article Panel — full-width stacked, ~55% on xl+ */}
        <div className="flex w-full min-w-0 flex-col overflow-hidden border-b border-[#D4DAE3] max-h-[50vh] xl:max-h-none xl:w-[55%] xl:border-b-0 xl:border-r">
          <PanelErrorBoundary panelName="Article">
            <ArticlePanel
              content={content}
              onContentChange={handleContentChange}
              savedContent={initialArticle.content}
              editorViewRef={editorViewRef}
              onHeadingsChange={setHeadings}
              articleSlug={initialArticle.slug}
              aleTestsYou={aleTestsYou}
              onAleTestsYouChange={(v) => {
                setAleTestsYou(v)
                dirty.markArticleDirty()
              }}
              updatedNote={updatedNote}
              onUpdatedNoteChange={(v) => {
                setUpdatedNote(v)
                dirty.markArticleDirty()
              }}
              subjectLabel={subjectLabel}
              onSubjectLabelChange={(v) => {
                setSubjectLabel(v)
                dirty.markArticleDirty()
              }}
              reviewerComments={reviewerComments}
              onReviewerCommentsChange={(v) => {
                setReviewerComments(v)
                dirty.markArticleDirty()
              }}
              reviewedBy={initialArticle.reviewed_by}
            />
          </PanelErrorBoundary>
        </div>

        {/* Questions Panel — full-width stacked, ~45% on xl+ */}
        <div className="flex w-full min-w-0 flex-col overflow-hidden max-h-[50vh] xl:max-h-none xl:w-[45%]">
          <PanelErrorBoundary panelName="Questions">
            <QuestionsPanel
              questions={questions}
              eiPrompts={eiPrompts}
              taxonomyNodes={taxonomyNodes}
              taxonomyLinks={taxonomyLinks}
              headings={headings}
              articleId={initialArticle.article_id}
              primaryNodeId={primaryNode?.node_id || null}
              onQuestionUpdate={handleQuestionUpdate}
              onEIPromptUpdate={handleEIPromptUpdate}
            />
          </PanelErrorBoundary>
        </div>
      </div>
    </div>
  )
}

// ─── Root Export (wraps with DirtyStateProvider) ──────────────

export const UnifiedContentEditor = (props: UnifiedContentEditorProps) => (
  <DirtyStateProvider>
    <EditorInner {...props} />
  </DirtyStateProvider>
)
