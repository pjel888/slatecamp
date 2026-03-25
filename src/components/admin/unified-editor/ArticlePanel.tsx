'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { EditorView } from '@codemirror/view'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Eyebrow } from '@/components/ui/eyebrow'
import type { ParsedHeading } from './types'

// ─── Props ────────────────────────────────────────────────────

interface ArticlePanelProps {
  content: string
  onContentChange: (val: string) => void
  savedContent: string
  editorViewRef: React.MutableRefObject<any>
  onHeadingsChange: (headings: ParsedHeading[]) => void
  /** Article slug for iframe-based student view preview */
  articleSlug: string
  aleTestsYou: string
  onAleTestsYouChange: (v: string) => void
  updatedNote: string
  onUpdatedNoteChange: (v: string) => void
  subjectLabel: string
  onSubjectLabelChange: (v: string) => void
  reviewerComments: string
  onReviewerCommentsChange: (v: string) => void
  reviewedBy: string | null
}

// ─── Snippet Templates ───────────────────────────────────────

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

// ─── SnippetDropdown ─────────────────────────────────────────

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
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-sm border border-border bg-white px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors duration-150 ease-out hover:bg-[#F8F7F5] hover:text-text-primary"
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="opacity-50">
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-md border border-border bg-white shadow-md">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                onInsert(item.snippet)
                setOpen(false)
              }}
              className="block w-full px-3 py-2 text-left text-xs text-text-primary transition-colors duration-150 ease-out hover:bg-primary-50 hover:text-camp-cobalt"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Diff Helpers ────────────────────────────────────────────

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  text: string
  lineNum: number | null
}

const computeDiff = (oldText: string, newText: string): DiffLine[] => {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  const result: DiffLine[] = []
  const maxLen = Math.max(oldLines.length, newLines.length)

  for (let i = 0; i < maxLen; i++) {
    const oldLine = i < oldLines.length ? oldLines[i] : undefined
    const newLine = i < newLines.length ? newLines[i] : undefined

    if (oldLine === newLine) {
      result.push({ type: 'unchanged', text: oldLine!, lineNum: i + 1 })
    } else {
      if (oldLine !== undefined) {
        result.push({ type: 'removed', text: oldLine, lineNum: i + 1 })
      }
      if (newLine !== undefined) {
        result.push({ type: 'added', text: newLine, lineNum: i + 1 })
      }
    }
  }

  return result
}

const countChangedLines = (oldText: string, newText: string): number => {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  let changes = 0
  const maxLen = Math.max(oldLines.length, newLines.length)

  for (let i = 0; i < maxLen; i++) {
    if ((oldLines[i] ?? '') !== (newLines[i] ?? '')) {
      changes++
    }
  }

  return changes
}

// ─── Heading Parser ──────────────────────────────────────────

const parseHeadings = (source: string): ParsedHeading[] => {
  const headings: ParsedHeading[] = []
  const lines = source.split('\n')
  let inCodeBlock = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Track code fences
    if (line.trimStart().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }

    if (inCodeBlock) continue

    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (match) {
      headings.push({
        level: match[1].length as 2 | 3,
        text: match[2].trim(),
        position: i,
      })
    }
  }

  return headings
}

// ─── Main Component ──────────────────────────────────────────

export const ArticlePanel = ({
  content,
  onContentChange,
  savedContent,
  editorViewRef,
  onHeadingsChange,
  articleSlug,
  aleTestsYou,
  onAleTestsYouChange,
  updatedNote,
  onUpdatedNoteChange,
  subjectLabel,
  onSubjectLabelChange,
  reviewerComments,
  onReviewerCommentsChange,
  reviewedBy,
}: ArticlePanelProps) => {
  // ── Preview state ────────────────────────────────────────

  // ── Heading parse debounce ───────────────────────────────
  const headingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Metadata collapsed state ─────────────────────────────
  const [metadataOpen, setMetadataOpen] = useState(false)

  // ── Diff count (memoized) ────────────────────────────────
  const diffCount = useMemo(
    () => countChangedLines(savedContent, content),
    [savedContent, content]
  )

  // ── Diff lines (memoized) ───────────────────────────────
  const diffLines = useMemo(
    () => computeDiff(savedContent, content),
    [savedContent, content]
  )

  // Preview is now iframe-based (Student View) — no client-side MDX compilation needed

  // ── Parse headings with 300ms debounce ───────────────────
  useEffect(() => {
    if (headingDebounceRef.current) clearTimeout(headingDebounceRef.current)
    headingDebounceRef.current = setTimeout(() => {
      const parsed = parseHeadings(content)
      onHeadingsChange(parsed)
    }, 300)
    return () => {
      if (headingDebounceRef.current) clearTimeout(headingDebounceRef.current)
    }
  }, [content, onHeadingsChange])

  // ── Snippet insertion at cursor ──────────────────────────
  const insertSnippet = useCallback(
    (snippet: string) => {
      const view = editorViewRef.current
      if (!view) {
        onContentChange(content + '\n' + snippet)
        return
      }
      const { from, to } = view.state.selection.main
      const insertion = '\n' + snippet + '\n'
      view.dispatch({
        changes: { from, to, insert: insertion },
        selection: { anchor: from + insertion.length },
      })
      view.focus()
    },
    [editorViewRef, onContentChange, content]
  )

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Tabs defaultValue="editor" className="flex flex-1 flex-col min-h-0 overflow-hidden">
        {/* ── Tab Header ─────────────────────────────────── */}
        <div className="shrink-0 border-b border-border bg-[#F8F7F5] px-3">
          <TabsList variant="underline" className="gap-0 border-b-0">
            <TabsTrigger value="editor" className="text-xs">
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs">
              Student View
            </TabsTrigger>
            <TabsTrigger value="diff" className="text-xs">
              Diff{diffCount > 0 && (
                <span className="ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-primary-50 px-1.5 py-0.5 font-mono text-[11px] font-medium leading-none text-camp-cobalt">
                  {diffCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── Editor Tab ─────────────────────────────────── */}
        <TabsContent value="editor" className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Snippet Toolbar */}
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-white px-3 py-2">
            <Eyebrow className="mr-1">Insert</Eyebrow>
            {SNIPPET_GROUPS.map((group) => (
              <SnippetDropdown
                key={group.label}
                label={group.label}
                items={group.items}
                onInsert={insertSnippet}
              />
            ))}
          </div>

          {/* CodeMirror */}
          <div className="min-h-0 flex-1 overflow-auto bg-white">
            <CodeMirror
              value={content}
              onChange={onContentChange}
              extensions={[markdown(), EditorView.lineWrapping]}
              onCreateEditor={(view) => {
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
        </TabsContent>

        {/* ── Student View Tab (iframe of actual wiki page) ─ */}
        <TabsContent value="preview" className="min-h-0 flex-1 overflow-hidden">
          {articleSlug ? (
            <div className="flex h-full flex-col">
              {/* Toolbar */}
              <div className="flex shrink-0 items-center gap-3 border-b border-border bg-[#F8F7F5] px-3 py-1.5">
                <Eyebrow>Student View</Eyebrow>
                <span className="text-[11px] text-text-secondary">
                  Shows the saved article exactly as students see it
                </span>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => {
                    const iframe = document.getElementById('wiki-preview-iframe') as HTMLIFrameElement
                    if (iframe) iframe.src = iframe.src
                  }}
                  className="rounded-sm border border-border bg-white px-2.5 py-1 text-[11px] font-medium text-text-secondary hover:bg-[#F8F7F5] hover:text-text-primary transition-colors duration-150"
                >
                  Refresh
                </button>
                <a
                  href={`/dashboard/wiki/${articleSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm border border-border bg-white px-2.5 py-1 text-[11px] font-medium text-camp-cobalt hover:bg-primary-50 transition-colors duration-150"
                >
                  Open in new tab
                </a>
              </div>
              {/* Iframe */}
              <iframe
                id="wiki-preview-iframe"
                src={`/dashboard/wiki/${articleSlug}`}
                className="flex-1 w-full border-0 bg-white"
                title="Article preview — student view"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-sm font-medium text-text-primary mb-1">
                  Save the article first to preview
                </p>
                <p className="text-xs text-text-tertiary">
                  The student view loads the saved article from the wiki page.
                  Save your changes, then switch to this tab.
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Diff Tab ───────────────────────────────────── */}
        <TabsContent value="diff" className="min-h-0 flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto bg-white p-4">
          {diffCount === 0 ? (
            <p className="text-sm italic text-text-tertiary">
              No changes from saved version.
            </p>
          ) : (
            <pre className="font-mono text-xs leading-relaxed">
              <code>
                {diffLines.map((line, idx) => {
                  if (line.type === 'added') {
                    return (
                      <div
                        key={`${idx}-a`}
                        className="rounded-sm bg-[#EDFAF4] px-2 py-px text-emerald"
                      >
                        <span className="mr-3 inline-block w-4 select-none text-right opacity-50">+</span>
                        {line.text}
                      </div>
                    )
                  }
                  if (line.type === 'removed') {
                    return (
                      <div
                        key={`${idx}-r`}
                        className="rounded-sm bg-[#FDF0F0] px-2 py-px text-destructive"
                      >
                        <span className="mr-3 inline-block w-4 select-none text-right opacity-50">-</span>
                        {line.text}
                      </div>
                    )
                  }
                  return (
                    <div key={`${idx}-u`} className="px-2 py-px text-text-primary">
                      <span className="mr-3 inline-block w-4 select-none text-right text-text-tertiary">&nbsp;</span>
                      {line.text}
                    </div>
                  )
                })}
              </code>
            </pre>
          )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Article Metadata (Collapsible) ─────────────────── */}
      <div className="shrink-0 border-t border-border bg-[#F8F7F5]">
        <button
          type="button"
          onClick={() => setMetadataOpen((v) => !v)}
          className="flex w-full items-center gap-1.5 px-3 py-2 text-left transition-colors duration-150 ease-out hover:bg-primary-50"
        >
          <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-text-tertiary">
            Article Metadata
          </span>
          <span className="text-[11px] text-text-tertiary">
            {metadataOpen ? '\u25BE' : '\u25B8'}
          </span>
        </button>

        {metadataOpen && (
          <div className="grid grid-cols-2 gap-3 border-t border-border bg-white px-3 py-3">
            {/* ale_tests_you */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[11px] font-medium uppercase tracking-widest text-text-tertiary">
                What this tests you on
              </label>
              <input
                type="text"
                value={aleTestsYou}
                onChange={(e) => onAleTestsYouChange(e.target.value)}
                className="rounded-sm border border-border bg-white px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-tertiary transition-colors duration-150 ease-out focus:border-camp-cobalt focus:outline-none"
                placeholder="Key topics tested..."
              />
            </div>

            {/* updated_note */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[11px] font-medium uppercase tracking-widest text-text-tertiary">
                What changed
              </label>
              <input
                type="text"
                value={updatedNote}
                onChange={(e) => onUpdatedNoteChange(e.target.value)}
                className="rounded-sm border border-border bg-white px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-tertiary transition-colors duration-150 ease-out focus:border-camp-cobalt focus:outline-none"
                placeholder="Summary of changes..."
              />
            </div>

            {/* subject_label */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[11px] font-medium uppercase tracking-widest text-text-tertiary">
                Subject label
              </label>
              <input
                type="text"
                value={subjectLabel}
                onChange={(e) => onSubjectLabelChange(e.target.value)}
                className="rounded-sm border border-border bg-white px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-tertiary transition-colors duration-150 ease-out focus:border-camp-cobalt focus:outline-none"
                placeholder="e.g. Real Property"
              />
            </div>

            {/* reviewed_by */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[11px] font-medium uppercase tracking-widest text-text-tertiary">
                Reviewed by
              </label>
              <span className="rounded-sm border border-border bg-[#F8F7F5] px-2.5 py-1.5 font-mono text-[11px] text-text-tertiary">
                {reviewedBy || '\u2014'}
              </span>
            </div>

            {/* reviewer_comments — full width */}
            <div className="col-span-2 flex flex-col gap-1">
              <label className="font-mono text-[11px] font-medium uppercase tracking-widest text-text-tertiary">
                Reviewer comments
              </label>
              <textarea
                value={reviewerComments}
                onChange={(e) => onReviewerCommentsChange(e.target.value)}
                rows={3}
                className="rounded-sm border border-border bg-white px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-tertiary transition-colors duration-150 ease-out focus:border-camp-cobalt focus:outline-none"
                placeholder="Notes from review..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
