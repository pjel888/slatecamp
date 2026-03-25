'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { EditorView } from '@codemirror/view'
import { evaluate } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import remarkGfm from 'remark-gfm'
import { baseMdxComponents } from '@/components/wiki/mdx-components-shared'
import { updateWikiArticle, createWikiArticle } from '@/lib/actions/admin/wiki'
import { ArticlePreviewTab } from '@/components/admin/ArticlePreviewTab'
import { ComponentToolbar } from '@/components/admin/ComponentToolbar'
import { ArticlePropertiesPanel } from '@/components/admin/ArticlePropertiesPanel'
import { Eyebrow } from '@/components/ui/eyebrow'
import type { ReactElement } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdminMDXEditorProps {
  article?: {
    article_id: string
    title: string
    slug: string
    content: string
    status: string
    updated_at: string
    ale_id?: string
  }
}

// ---------------------------------------------------------------------------
// Snippet templates
// ---------------------------------------------------------------------------

const SNIPPET_GROUPS = [
  {
    label: 'Callouts',
    items: [
      { label: 'Note', snippet: '<Note>\n  Content here\n</Note>' },
      { label: 'Warn', snippet: '<Warn>\n  Content here\n</Warn>' },
      { label: 'Tip', snippet: '<Tip>\n  Content here\n</Tip>' },
      { label: 'Example', snippet: '<Example>\n  Content here\n</Example>' },
      { label: 'ExamTip', snippet: '<ExamTip>\n  Content here\n</ExamTip>' },
      { label: 'Callout', snippet: '<Callout variant="note" title="">\n  Content here\n</Callout>' },
    ],
  },
  {
    label: 'Legal',
    items: [
      {
        label: 'LawCallout',
        snippet: '<LawCallout code="nbcp" section="">\n  Provision text\n</LawCallout>',
      },
      {
        label: 'AuthorityContent',
        snippet: '<AuthorityContent source="" citation="">\n  Content here\n</AuthorityContent>',
      },
    ],
  },
  {
    label: 'Interactive',
    items: [
      {
        label: 'InlineQuiz',
        snippet: `<InlineQuiz\n  question="Your question"\n  options="[{\\"text\\":\\"Option A\\",\\"is_correct\\":false},{\\"text\\":\\"Option B\\",\\"is_correct\\":true},{\\"text\\":\\"Option C\\",\\"is_correct\\":false},{\\"text\\":\\"Option D\\",\\"is_correct\\":false}]"\n  rationale="Explanation"\n/>`,
      },
      {
        label: 'KeyValues',
        snippet: '<KeyValues items="[{\\"key\\":\\"Term\\",\\"value\\":\\"Definition\\"}]" />',
      },
      {
        label: 'FormulaBlock',
        snippet: '<FormulaBlock formula="" label="" note="" />',
      },
      {
        label: 'Tabs',
        snippet: '<Tabs>\n  <Tab label="Tab 1">\n    Content\n  </Tab>\n  <Tab label="Tab 2">\n    Content\n  </Tab>\n</Tabs>',
      },
      {
        label: 'Accordion',
        snippet: '<Accordion>\n  <AccordionItem title="Section 1">\n    Content here\n  </AccordionItem>\n</Accordion>',
      },
    ],
  },
  {
    label: 'Exam',
    items: [
      {
        label: 'WikiMistakeCard',
        snippet: '<WikiMistakeCard mistake="" correction="" />',
      },
      {
        label: 'WikiCalloutBox',
        snippet: '<WikiCalloutBox type="exam" title="">\n  Content here\n</WikiCalloutBox>',
      },
      {
        label: 'AlertBox',
        snippet: '<AlertBox type="warning" title="">\n  Content here\n</AlertBox>',
      },
      {
        label: 'ComparisonTable',
        snippet: '<ComparisonTable headers="[\\"Item A\\",\\"Item B\\"]" rows="[[\\"Row 1A\\",\\"Row 1B\\"]]" />',
      },
      {
        label: 'ProcessFlow',
        snippet: '<ProcessFlow steps="[{\\"label\\":\\"Step 1\\",\\"description\\":\\"Details\\"}]" />',
      },
    ],
  },
  {
    label: 'Structure',
    items: [
      {
        label: 'WikiPartHeader',
        snippet: '<WikiPartHeader part={1} title="" subtitle="" />',
      },
      {
        label: 'WikiChangedPill',
        snippet: '<WikiChangedPill date="" summary="" />',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')

const formatDate = (iso: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const countWords = (text: string) =>
  text.split(/\s+/).filter(Boolean).length

// ---------------------------------------------------------------------------
// SnippetDropdown sub-component
// ---------------------------------------------------------------------------

interface SnippetDropdownProps {
  label: string
  items: { label: string; snippet: string }[]
  onInsert: (snippet: string) => void
}

const SnippetDropdown = ({ label, items, onInsert }: SnippetDropdownProps) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 rounded-sm border border-border bg-white px-2.5 py-1 text-xs font-medium text-text-secondary hover:bg-surface-light hover:text-text-primary transition-colors duration-150"
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="opacity-50">
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-md border border-border bg-white shadow-md">
          {items.map(item => (
            <button
              key={item.label}
              type="button"
              onMouseDown={e => {
                e.preventDefault()
                onInsert(item.snippet)
                setOpen(false)
              }}
              className="block w-full px-3 py-2 text-left text-xs text-text-primary hover:bg-primary-50 hover:text-camp-cobalt transition-colors duration-150"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const AdminMDXEditor = ({ article }: AdminMDXEditorProps) => {
  const router = useRouter()

  const [title, setTitle] = useState(article?.title ?? '')
  const [slug, setSlug] = useState(article?.slug ?? '')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!article?.slug)
  const [status, setStatus] = useState(article?.status ?? 'draft')
  const [content, setContent] = useState(article?.content ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Properties panel fields
  const [difficultyLabel, setDifficultyLabel] = useState('')
  const [aleTestsYou, setAleTestsYou] = useState('')
  const [updatedNote, setUpdatedNote] = useState('')
  const [reviewerComments, setReviewerComments] = useState('')

  // Preview state
  const [previewNode, setPreviewNode] = useState<ReactElement | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // CodeMirror editor view ref for cursor insertion
  const editorViewRef = useRef<EditorView | null>(null)

  // ---------------------------------------------------------------------------
  // Auto-slug from title
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(generateSlug(title))
    }
  }, [title, slugManuallyEdited])

  // ---------------------------------------------------------------------------
  // Live MDX preview with 300ms debounce
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (!content.trim()) {
        setPreviewNode(null)
        setPreviewError(null)
        return
      }
      try {
        const { default: MDXContent } = await evaluate(content, {
          ...(runtime as any),
          remarkPlugins: [remarkGfm],
          development: false,
        })
        setPreviewNode(
          (MDXContent as any)({ components: baseMdxComponents as any })
        )
        setPreviewError(null)
      } catch (err: unknown) {
        setPreviewError(err instanceof Error ? err.message : String(err))
        setPreviewNode(null)
      }
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [content])

  // ---------------------------------------------------------------------------
  // Snippet insertion at CodeMirror cursor
  // ---------------------------------------------------------------------------
  const insertSnippet = useCallback((snippet: string) => {
    const view = editorViewRef.current
    if (!view) {
      setContent(prev => prev + '\n' + snippet)
      return
    }
    const { from, to } = view.state.selection.main
    const insertion = '\n' + snippet + '\n'
    view.dispatch({
      changes: { from, to, insert: insertion },
      selection: { anchor: from + insertion.length },
    })
    view.focus()
  }, [])

  // ---------------------------------------------------------------------------
  // Properties panel field handler
  // ---------------------------------------------------------------------------
  const handlePanelFieldChange = useCallback((field: string, value: string) => {
    switch (field) {
      case 'status': setStatus(value); break
      case 'difficultyLabel': setDifficultyLabel(value); break
      case 'aleTestsYou': setAleTestsYou(value); break
      case 'updatedNote': setUpdatedNote(value); break
      case 'reviewerComments': setReviewerComments(value); break
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------
  const handleSave = async () => {
    if (!title.trim()) {
      setSaveError('Title is required')
      return
    }
    setIsSaving(true)
    setSaveError(null)
    setSaveMsg(null)

    const payload = { title, content, slug: slug || generateSlug(title), status }

    const result = article?.article_id
      ? await updateWikiArticle(article.article_id, payload)
      : await createWikiArticle(payload)

    setIsSaving(false)

    if (result.error) {
      setSaveError(result.error.message)
    } else {
      setSaveMsg('Saved')
      setTimeout(() => setSaveMsg(null), 2500)
      router.refresh()
      if (!article?.article_id && 'data' in result && result.data) {
        router.push(`/admin/articles/${(result.data as any).article_id}`)
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const wordCount = countWords(content)

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-surface-light">
      {/* ------------------------------------------------------------------ */}
      {/* Metadata bar                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex shrink-0 items-center gap-4 border-b border-border bg-white px-4 py-2.5">
        <Link
          href="/admin/articles"
          className="shrink-0 rounded-sm px-2 py-1 text-xs text-text-secondary hover:bg-surface-light hover:text-text-primary transition-colors duration-150"
        >
          &larr; Articles
        </Link>

        <div className="h-4 w-px bg-border" />

        {/* Title */}
        <input
          type="text"
          placeholder="Article title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-text-primary placeholder:text-text-tertiary focus:outline-none"
        />

        <div className="h-4 w-px bg-border" />

        {/* Slug */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-mono text-[11px] text-text-tertiary">/</span>
          <input
            type="text"
            value={slug}
            onChange={e => {
              setSlug(e.target.value)
              setSlugManuallyEdited(true)
            }}
            placeholder="article-slug"
            className="w-40 rounded-sm border border-transparent bg-transparent font-mono text-[11px] text-text-secondary placeholder:text-text-tertiary focus:border-border focus:bg-white focus:outline-none px-1 py-0.5 transition-colors duration-150"
          />
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Status toggle */}
        <button
          type="button"
          onClick={() => setStatus(s => s === 'published' ? 'draft' : 'published')}
          className={`shrink-0 rounded-sm px-2.5 py-1 font-mono text-[11px] font-medium transition-colors duration-150 ${
            status === 'published'
              ? 'bg-success-50 text-emerald hover:bg-[#d5f5e8]'
              : 'bg-warning-50 text-warning hover:bg-[#fdefd0]'
          }`}
        >
          {status === 'published' ? 'Published' : 'Draft'}
        </button>

        {/* ALE ID (read-only) */}
        {article?.ale_id && (
          <>
            <div className="h-4 w-px bg-border" />
            <span className="shrink-0 font-mono text-[11px] text-text-tertiary">{article.ale_id}</span>
          </>
        )}

        {/* Word count */}
        <div className="h-4 w-px bg-border" />
        <span className="shrink-0 font-mono text-[11px] text-text-tertiary">
          {wordCount.toLocaleString()} w
        </span>

        {/* Updated at */}
        {article?.updated_at && (
          <>
            <div className="h-4 w-px bg-border" />
            <span className="shrink-0 text-[11px] text-text-tertiary">
              {formatDate(article.updated_at)}
            </span>
          </>
        )}

        <div className="h-4 w-px bg-border" />

        {/* Save feedback */}
        {saveMsg && (
          <span className="shrink-0 font-mono text-[11px] text-emerald">{saveMsg}</span>
        )}
        {saveError && (
          <span className="shrink-0 font-mono text-[11px] text-destructive">{saveError}</span>
        )}

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="shrink-0 rounded-sm bg-camp-cobalt px-4 py-1.5 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-primary-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : article?.article_id ? 'Save' : 'Create'}
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Component insertion toolbar                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-white px-4 py-2">
        <Eyebrow className="mr-1">Insert</Eyebrow>
        {SNIPPET_GROUPS.map(group => (
          <SnippetDropdown
            key={group.label}
            label={group.label}
            items={group.items}
            onInsert={insertSnippet}
          />
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Component toolbar                                                   */}
      {/* ------------------------------------------------------------------ */}
      <ComponentToolbar onInsert={insertSnippet} />

      {/* ------------------------------------------------------------------ */}
      {/* Split pane + properties panel                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left: CodeMirror editor */}
        <div className="flex w-1/2 flex-col overflow-hidden border-r border-border">
          <div className="shrink-0 border-b border-border bg-surface-light px-4 py-1.5">
            <Eyebrow>MDX Source</Eyebrow>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <CodeMirror
              value={content}
              onChange={setContent}
              extensions={[markdown(), EditorView.lineWrapping]}
              onCreateEditor={view => {
                editorViewRef.current = view
              }}
              basicSetup={{
                lineNumbers: true,
                foldGutter: false,
                dropCursor: false,
                allowMultipleSelections: false,
                indentOnInput: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: false,
                rectangularSelection: false,
                crosshairCursor: false,
                highlightActiveLine: true,
                highlightSelectionMatches: false,
                closeBracketsKeymap: true,
                defaultKeymap: true,
                searchKeymap: false,
                historyKeymap: true,
                foldKeymap: false,
                completionKeymap: false,
                lintKeymap: false,
              }}
              theme="light"
              style={{ fontSize: '13px', height: '100%' }}
              height="100%"
            />
          </div>
        </div>

        {/* Centre: Student-view preview */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <ArticlePreviewTab
            previewNode={previewNode}
            previewError={previewError}
            title={title}
          />
        </div>

        {/* Right: Article properties panel */}
        <ArticlePropertiesPanel
          articleId={article?.article_id}
          slug={slug}
          status={status}
          difficultyLabel={difficultyLabel}
          aleTestsYou={aleTestsYou}
          updatedNote={updatedNote}
          reviewedBy={undefined}
          reviewerComments={reviewerComments}
          createdAt={undefined}
          updatedAt={article?.updated_at}
          onFieldChange={handlePanelFieldChange}
        />
      </div>
    </div>
  )
}
