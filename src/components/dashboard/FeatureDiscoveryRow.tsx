'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import type { DailyWikiArticle, NotePreview } from '@/types/dashboard'

// ── DailyWikiCard ───────────────────────────────────────────────────────────

interface DailyWikiCardProps {
  article: DailyWikiArticle | null
}

export function DailyWikiCard({ article }: DailyWikiCardProps) {
  return (
    <Card className="border-0 p-4 overflow-hidden relative" style={{ backgroundColor: '#0F1F5C' }}>
      <div className="flex items-center gap-1.5 mb-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className="text-sm font-semibold text-white cursor-default">
              Today&apos;s article
            </h3>
          </TooltipTrigger>
          <TooltipContent side="top">
            A different expert-written article from the SlateCamp Wiki every day. Reading one article per session is one of the fastest ways to fill your heatmap gaps.
          </TooltipContent>
        </Tooltip>
      </div>
      <p className="text-[11px] text-white/50 mb-3">
        From the SlateCamp Wiki — updated daily
      </p>

      {article ? (
        <>
          <p className="text-sm font-semibold text-white leading-tight mb-1.5">
            {article.title}
          </p>
          <p className="text-xs text-white/70 leading-snug line-clamp-3 mb-3">
            {article.excerpt}
          </p>
          <Link
            href={`/dashboard/wiki/${article.slug}`}
            className="text-[11px] font-medium text-white/90 underline underline-offset-2"
          >
            Read article →
          </Link>
        </>
      ) : (
        <p className="text-xs text-white/50 py-4">
          Your wiki is being set up. Articles will appear here soon.
        </p>
      )}
    </Card>
  )
}

// ── LabPreviewCard ──────────────────────────────────────────────────────────

interface LabPreviewCardProps {
  moduleCount: number
}

export function LabPreviewCard({ moduleCount }: LabPreviewCardProps) {
  return (
    <Card
      className="border-0 p-4 overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #1B3FC4 0%, #2A5BD7 100%)',
      }}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className="text-sm font-semibold text-white cursor-default">
              3D Lab
            </h3>
          </TooltipTrigger>
          <TooltipContent side="top">
            SlateCamp&apos;s interactive 3D models let you explore building codes and structural systems spatially — not just read about them.
          </TooltipContent>
        </Tooltip>
      </div>
      <p className="text-[11px] text-white/50 mb-3">
        Interactive architectural models
      </p>

      <p className="text-xs text-white/70 leading-snug mb-3">
        Explore building codes, structural systems, and spatial concepts through
        interactive 3D models you can rotate, cut, and explore.
      </p>

      {/* CSS animated geometric shape */}
      <div className="absolute right-3 top-3 w-12 h-12 pointer-events-none opacity-20">
        <div
          className="w-full h-full border-2 border-white rounded-sm"
          style={{
            animation: 'spin 12s linear infinite',
            transformOrigin: 'center',
          }}
        />
        <div
          className="absolute inset-1 border border-white/60 rounded-sm"
          style={{
            animation: 'spin 8s linear infinite reverse',
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="font-dm-mono text-[11px] text-white/50">
          {moduleCount > 0 ? `${moduleCount} modules` : '186 modules planned'}
        </span>
        <Link
          href="/dashboard/3d-lab"
          className="text-[11px] font-medium text-white/90 underline underline-offset-2"
        >
          Explore 3D Lab →
        </Link>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Card>
  )
}

// ── RecentNotesCard ─────────────────────────────────────────────────────────

interface RecentNotesCardProps {
  notes: NotePreview[]
  totalNoteCount?: number
}

export function RecentNotesCard({ notes, totalNoteCount }: RecentNotesCardProps) {
  return (
    <Card className="border p-4" style={{ borderColor: '#D4DAE3', backgroundColor: '#F2F0EB' }}>
      <div className="flex items-center gap-1.5 mb-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className="text-sm font-semibold cursor-default" style={{ color: '#1A2332' }}>
              Your Notes
            </h3>
          </TooltipTrigger>
          <TooltipContent side="top">
            Notes you&apos;ve saved while reading articles in the Wiki or reviewing quiz explanations. Everything is tagged to the ALE taxonomy automatically.
          </TooltipContent>
        </Tooltip>
      </div>
      <p className="text-[11px] mb-3" style={{ color: '#8896A7' }}>
        Captured from your study sessions
      </p>

      {notes.length === 0 ? (
        <div className="py-3">
          <p className="text-xs mb-2" style={{ color: '#4A5568' }}>
            Your notes workspace is ready. Highlight any text in the Wiki to save your first note.
          </p>
          <Link
            href="/dashboard/notes"
            className="text-[11px] font-medium underline underline-offset-2"
            style={{ color: '#1B3FC4' }}
          >
            Open Notes →
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {notes.map((note) => (
              <div key={note.noteId} className="bg-white rounded-sm p-2 border" style={{ borderColor: '#D4DAE3' }}>
                <p className="text-xs font-medium truncate" style={{ color: '#1A2332' }}>
                  {note.title}
                </p>
                <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: '#8896A7' }}>
                  {note.snippet}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2">
            <Link
              href="/dashboard/notes"
              className="text-[11px] font-medium underline underline-offset-2"
              style={{ color: '#1B3FC4' }}
            >
              Open all {totalNoteCount ?? notes.length} notes →
            </Link>
          </div>
        </>
      )}
    </Card>
  )
}

// ── Skeleton ────────────────────────────────────────────────────────────────

export function FeatureDiscoverySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border p-4" style={{ borderColor: '#D4DAE3' }}>
          <Skeleton className="h-4 w-28 mb-1" />
          <Skeleton className="h-3 w-40 mb-3" />
          <Skeleton className="h-12 w-full mb-2" />
          <Skeleton className="h-3 w-24" />
        </Card>
      ))}
    </div>
  )
}
