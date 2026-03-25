'use client'

import { useState } from 'react'
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
  <div className="px-4 py-3 border-b border-[#D4DAE3] last:border-b-0">
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

  if (collapsed) {
    return (
      <div className="shrink-0 border-l border-[#D4DAE3] flex flex-col items-center pt-3 w-8 bg-white">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          title="Expand properties"
          className="rounded-sm p-1 text-[#8896A7] hover:bg-[#F8F7F5] hover:text-[#1A2332] transition-colors duration-150"
        >
          {/* Chevron left (expand) */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M7.5 2.5L4.5 6l3 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="w-[280px] shrink-0 border-l border-[#D4DAE3] overflow-y-auto bg-white flex flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#D4DAE3] px-4 py-2.5">
        <Eyebrow>Properties</Eyebrow>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          title="Collapse properties"
          className="rounded-sm p-1 text-[#8896A7] hover:bg-[#F8F7F5] hover:text-[#1A2332] transition-colors duration-150"
        >
          {/* Chevron right (collapse) */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 2.5L7.5 6l-3 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* STATUS */}
      <Section label="Status">
        <Select
          value={status ?? 'draft'}
          onValueChange={val => onFieldChange?.('status', val)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="review">In Review</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </Section>

      {/* DIFFICULTY */}
      <Section label="Difficulty">
        <Select
          value={difficultyLabel ?? ''}
          onValueChange={val => onFieldChange?.('difficultyLabel', val)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="— Select —" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Foundational">Foundational</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </Section>

      {/* TAXONOMY */}
      {(articleId || subjectLabel) && (
        <Section label="Taxonomy">
          {articleId && (
            <p
              className="text-[11px] text-[#8896A7] mb-1 truncate"
              style={{ fontFamily: 'var(--font-dm-mono), monospace' }}
              title={articleId}
            >
              {articleId}
            </p>
          )}
          {subjectLabel && (
            <p className="text-[11px] text-[#4A5568]">{subjectLabel}</p>
          )}
        </Section>
      )}

      {/* LEARNING */}
      <Section label="Learning">
        <textarea
          value={aleTestsYou ?? ''}
          onChange={e => onFieldChange?.('aleTestsYou', e.target.value)}
          placeholder="What this article tests you on..."
          rows={3}
          className="w-full resize-none rounded-sm border border-[#D4DAE3] bg-white px-2 py-1.5 text-[11px] text-[#1A2332] placeholder:text-[#8896A7] focus:border-[#1B3FC4] focus:outline-none transition-colors duration-150 leading-relaxed"
        />
      </Section>

      {/* NOTES */}
      <Section label="Notes">
        <textarea
          value={updatedNote ?? ''}
          onChange={e => onFieldChange?.('updatedNote', e.target.value)}
          placeholder="Update notes or change summary..."
          rows={3}
          className="w-full resize-none rounded-sm border border-[#D4DAE3] bg-white px-2 py-1.5 text-[11px] text-[#1A2332] placeholder:text-[#8896A7] focus:border-[#1B3FC4] focus:outline-none transition-colors duration-150 leading-relaxed"
        />
      </Section>

      {/* REVIEW */}
      <Section label="Review">
        {reviewedBy ? (
          <p
            className="mb-2 text-[11px] text-[#8896A7]"
            style={{ fontFamily: 'var(--font-dm-mono), monospace' }}
          >
            {reviewedBy}
          </p>
        ) : (
          <p className="mb-2 text-[11px] text-[#8896A7] italic">Not yet reviewed</p>
        )}
        <textarea
          value={reviewerComments ?? ''}
          onChange={e => onFieldChange?.('reviewerComments', e.target.value)}
          placeholder="Reviewer comments..."
          rows={3}
          className="w-full resize-none rounded-sm border border-[#D4DAE3] bg-white px-2 py-1.5 text-[11px] text-[#1A2332] placeholder:text-[#8896A7] focus:border-[#1B3FC4] focus:outline-none transition-colors duration-150 leading-relaxed"
        />
      </Section>

      {/* META */}
      <Section label="Meta">
        <div className="space-y-2">
          <div>
            <p
              className="mb-0.5 text-[11px] font-medium text-[#8896A7]"
              style={{ fontFamily: 'var(--font-dm-mono), monospace' }}
            >
              Created
            </p>
            <p className="text-[11px] text-[#4A5568]">{formatDate(createdAt)}</p>
          </div>
          <div>
            <p
              className="mb-0.5 text-[11px] font-medium text-[#8896A7]"
              style={{ fontFamily: 'var(--font-dm-mono), monospace' }}
            >
              Updated
            </p>
            <p className="text-[11px] text-[#4A5568]">{formatDate(updatedAt)}</p>
          </div>
        </div>
      </Section>
    </div>
  )
}
