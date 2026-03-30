'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eyebrow } from '@/components/ui/eyebrow'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ArticlePropertiesPanelProps {
  articleId?: string
  slug?: string
  status?: string
  nodeId?: string | null
  taxonomyNodes?: any[]
  difficultyLabel?: string
  aleTestsYou?: string
  updatedNote?: string
  subjectLabel?: string
  reviewedBy?: string
  reviewerComments?: string
  createdAt?: string
  updatedAt?: string
  onFieldChange?: (field: string, value: string) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatDate = (iso: string | undefined) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// ---------------------------------------------------------------------------
// Section sub-component
// ---------------------------------------------------------------------------

interface SectionProps {
  label: string
  children: React.ReactNode
}

const Section = ({ label, children }: SectionProps) => (
  <div className="px-4 py-3 border-b border-border last:border-b-0">
    <Eyebrow className="mb-2 block">{label}</Eyebrow>
    {children}
  </div>
)

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const ArticlePropertiesPanel = ({
  articleId,
  slug,
  status,
  nodeId,
  taxonomyNodes = [],
  difficultyLabel,
  aleTestsYou,
  updatedNote,
  subjectLabel,
  reviewedBy,
  reviewerComments,
  createdAt,
  updatedAt,
  onFieldChange,
}: ArticlePropertiesPanelProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)

  // 1. Get all Subjects (Level 1)
  const subjects = useMemo(() => {
    return taxonomyNodes
      .filter(n => n.level == 1)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [taxonomyNodes])

  // 2. Initialize Subject if nodeId exists
  useEffect(() => {
    if (nodeId && taxonomyNodes.length > 0) {
      const currentNode = taxonomyNodes.find(n => n.node_id === nodeId)
      if (currentNode) {
        if (currentNode.level == 1) {
          setSelectedSubjectId(currentNode.node_id)
        } else if (currentNode.level == 2 && currentNode.parent_id) {
          setSelectedSubjectId(currentNode.parent_id)
        }
      }
    }
  }, [nodeId, taxonomyNodes])

  // 3. Get Subtopics for selected Subject
  const subtopics = useMemo(() => {
    if (!selectedSubjectId) return []
    return taxonomyNodes
      .filter(n => n.parent_id === selectedSubjectId && n.level == 2)
      .sort((a, b) => {
        // Enforce specific sorting
        if (a.name === 'Subject Overview & Strategy') return -1
        if (b.name === 'Subject Overview & Strategy') return 1
        if (a.name === 'Subject Mastery & Connections') return 1
        if (b.name === 'Subject Mastery & Connections') return -1
        return (a.sort_order ?? 99) - (b.sort_order ?? 99) || a.name.localeCompare(b.name)
      })
  }, [selectedSubjectId, taxonomyNodes])

  if (collapsed) {
    return (
      <div className="shrink-0 border-l border-border flex flex-col items-center pt-3 w-8 bg-white">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          title="Expand properties"
          className="rounded-sm p-1 text-text-tertiary hover:bg-surface-light hover:text-text-primary transition-colors duration-150"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M7.5 2.5L4.5 6l3 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="w-[280px] shrink-0 border-l border-border overflow-y-auto bg-white flex flex-col shadow-sm">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2.5 bg-surface-light/50">
        <div className="flex items-center gap-2">
          <Eyebrow>Article Properties</Eyebrow>
          {!nodeId && <span className="flex h-1.5 w-1.5 rounded-full bg-warning" title="Taxonomy missing" />}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          title="Collapse properties"
          className="rounded-sm p-1 text-text-tertiary hover:bg-surface-light hover:text-text-primary transition-colors duration-150"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 2.5L7.5 6l-3 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* TAXONOMY — DEPENDENT DROPDOWNS */}
      <Section label="Taxonomy Mapping">
        <div className="space-y-3">
          {/* Step 1: Subject */}
          <div className="space-y-1">
            <label className="text-[10px] text-text-tertiary uppercase font-medium">1. Select Subject</label>
            <Select
              value={selectedSubjectId ?? ''}
              onValueChange={val => {
                setSelectedSubjectId(val)
                onFieldChange?.('node_id', val) 
              }}
            >
              <SelectTrigger className="w-full text-[11px] h-8">
                <SelectValue placeholder="— Pick Subject —">
                  {selectedSubjectId && subjects.find(s => s.node_id === selectedSubjectId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {subjects.map(s => (
                  <SelectItem key={s.node_id} value={s.node_id} className="text-[11px]">
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 2: Subtopic */}
          <div className="space-y-1">
            <label className={`text-[10px] uppercase font-medium ${!selectedSubjectId ? 'text-text-tertiary opacity-50' : 'text-text-tertiary'}`}>
              2. Select Subtopic
            </label>
            <Select
              value={nodeId && subtopics.some(s => s.node_id === nodeId) ? nodeId : ''}
              disabled={!selectedSubjectId}
              onValueChange={val => onFieldChange?.('node_id', val)}
            >
              <SelectTrigger className={`w-full text-[11px] h-8 ${!nodeId && selectedSubjectId ? 'border-warning/50 bg-warning-50/10' : ''}`}>
                <SelectValue placeholder={selectedSubjectId ? "— Pick Subtopic —" : "Select subject first"}>
                  {nodeId && subtopics.find(st => st.node_id === nodeId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {subtopics.map(st => (
                  <SelectItem key={st.node_id} value={st.node_id} className="text-[11px]">
                    {st.name}
                  </SelectItem>
                ))}
                {selectedSubjectId && subtopics.length === 0 && (
                  <div className="p-2 text-[10px] text-text-tertiary italic text-center">
                    No subtopics defined
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {!nodeId && (
            <p className="text-[10px] text-warning font-medium">Mapping is required for visibility.</p>
          )}
          
          {nodeId && (
            <div className="flex items-center justify-between border-t pt-2 mt-2">
               <span className="text-[10px] text-success font-medium flex items-center gap-1">
                 <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                   <path d="M2.5 6.5L4.5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                 </svg>
                 Mapped
               </span>
               <button
                onClick={() => {
                  setSelectedSubjectId(null)
                  onFieldChange?.('node_id', '')
                }}
                className="text-[10px] text-text-tertiary hover:text-destructive transition-colors"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </Section>

      {/* STATUS */}
      <Section label="Status">
        <Select
          value={status ?? 'draft'}
          onValueChange={val => onFieldChange?.('status', val)}
        >
          <SelectTrigger className="w-full text-[11px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft" className="text-[11px]">Draft</SelectItem>
            <SelectItem value="review" className="text-[11px]">In Review</SelectItem>
            <SelectItem value="published" className="text-[11px]">Published</SelectItem>
          </SelectContent>
        </Select>
      </Section>

      {/* DIFFICULTY */}
      <Section label="Difficulty">
        <Select
          value={difficultyLabel ?? ''}
          onValueChange={val => onFieldChange?.('difficultyLabel', val)}
        >
          <SelectTrigger className="w-full text-[11px] h-8">
            <SelectValue placeholder="— Select —" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Foundational" className="text-[11px]">Foundational</SelectItem>
            <SelectItem value="Intermediate" className="text-[11px]">Intermediate</SelectItem>
            <SelectItem value="Advanced" className="text-[11px]">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </Section>

      {/* LEARNING */}
      <Section label="Learning">
        <textarea
          value={aleTestsYou ?? ''}
          onChange={e => onFieldChange?.('aleTestsYou', e.target.value)}
          placeholder="What this article tests you on..."
          rows={3}
          className="w-full resize-none rounded-sm border border-border bg-white px-2 py-1.5 text-[11px] text-text-primary placeholder:text-text-tertiary focus:border-camp-cobalt focus:outline-none transition-colors duration-150 leading-relaxed"
        />
      </Section>

      {/* NOTES */}
      <Section label="Notes">
        <textarea
          value={updatedNote ?? ''}
          onChange={e => onFieldChange?.('updatedNote', e.target.value)}
          placeholder="Update notes or change summary..."
          rows={3}
          className="w-full resize-none rounded-sm border border-border bg-white px-2 py-1.5 text-[11px] text-text-primary placeholder:text-text-tertiary focus:border-camp-cobalt focus:outline-none transition-colors duration-150 leading-relaxed"
        />
      </Section>

      {/* REVIEW */}
      <Section label="Review">
        {reviewedBy ? (
          <p
            className="mb-2 text-[11px] text-text-tertiary"
            style={{ fontFamily: 'var(--font-dm-mono), monospace' }}
          >
            {reviewedBy}
          </p>
        ) : (
          <p className="mb-2 text-[11px] text-text-tertiary italic">Not yet reviewed</p>
        )}
        <textarea
          value={reviewerComments ?? ''}
          onChange={e => onFieldChange?.('reviewerComments', e.target.value)}
          placeholder="Reviewer comments..."
          rows={3}
          className="w-full resize-none rounded-sm border border-border bg-white px-2 py-1.5 text-[11px] text-text-primary placeholder:text-text-tertiary focus:border-camp-cobalt focus:outline-none transition-colors duration-150 leading-relaxed"
        />
      </Section>

      {/* META */}
      <Section label="Meta">
        <div className="space-y-2">
          {articleId && (
            <div>
               <p
                className="mb-0.5 text-[11px] font-medium text-text-tertiary"
                style={{ fontFamily: 'var(--font-dm-mono), monospace' }}
              >
                ID
              </p>
              <p className="text-[11px] text-text-tertiary truncate" title={articleId}>{articleId}</p>
            </div>
          )}
          <div>
            <p
              className="mb-0.5 text-[11px] font-medium text-text-tertiary"
              style={{ fontFamily: 'var(--font-dm-mono), monospace' }}
            >
              Created
            </p>
            <p className="text-[11px] text-text-secondary">{formatDate(createdAt)}</p>
          </div>
          <div>
            <p
              className="mb-0.5 text-[11px] font-medium text-text-tertiary"
              style={{ fontFamily: 'var(--font-dm-mono), monospace' }}
            >
              Updated
            </p>
            <p className="text-[11px] text-text-secondary">{formatDate(updatedAt)}</p>
          </div>
        </div>
      </Section>
    </div>
  )
}
