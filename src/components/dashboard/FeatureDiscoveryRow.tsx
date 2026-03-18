'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import type { DailyWikiArticle, NotePreview } from '@/types/dashboard'

// ── DailyWikiCard ───────────────────────────────────────────────────────────

interface DailyWikiCardProps {
  article: DailyWikiArticle | null
  notes: NotePreview[]
  totalNoteCount?: number
}

export function DailyWikiCard({
  article,
  notes,
  totalNoteCount,
}: DailyWikiCardProps) {
  return (
    <Card className='overflow-hidden relative h-full grid grid-rows-3 bg-white gap-2 p-2 border-0'>
      {/* ── 1/3: Today's Article (Camp Orange) ─────────────────────── */}
      <div className='rounded-md p-3 overflow-hidden relative flex flex-col bg-card-article border border-card-article-border min-h-0'>
        {/* Animated circles/oblongs */}
        <div className='absolute right-3 top-3 w-10 h-10 pointer-events-none opacity-20'>
          <div className='w-full h-full border-2 border-white rounded-full animate-[spin_12s_linear_infinite]' />
          <div className='absolute inset-0 w-8 h-5 top-2.5 left-1 border border-white/60 rounded-full animate-[spin_8s_linear_infinite_reverse]' />
        </div>

        <div className='flex items-center gap-1.5 mb-0.5'>
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className='font-dm-mono text-[11px] font-medium uppercase tracking-[0.15em] cursor-default text-white/80'>
                [ Today&apos;s Article ]
              </h3>
            </TooltipTrigger>
            <TooltipContent side='top'>
              A different expert-written article from the SlateCamp Wiki every
              day. Reading one article per session is one of the fastest ways to
              fill your heatmap gaps.
            </TooltipContent>
          </Tooltip>
        </div>
        <p className='text-[11px] mb-2 text-white/60'>
          From the SlateCamp Wiki — updated daily
        </p>
        {article ? (
          <>
            <p className='text-sm font-semibold leading-tight mb-1.5 text-white'>
              {article.title}
            </p>
            <p className='text-xs leading-snug line-clamp-3 text-white/80'>
              {article.excerpt}
            </p>
          </>
        ) : (
          <p className='text-xs text-white/60'>
            Your wiki is being set up. Articles will appear here soon.
          </p>
        )}
        <div className='mt-auto flex justify-end'>
          <Link
            href={
              article ? `/dashboard/wiki/${article.slug}` : '/dashboard/wiki'
            }
            className='text-[11px] font-medium underline underline-offset-2 text-white/90'
          >
            Read article →
          </Link>
        </div>
      </div>

      {/* ── 1/3: Notes (Signal Green bg) ───────────────────────────── */}
      <div className='rounded-md p-3 overflow-hidden relative flex flex-col bg-card-notes border border-card-notes-border min-h-0'>
        {/* Animated triangles */}
        <svg
          className='absolute right-3 top-3 w-10 h-10 pointer-events-none opacity-20 animate-[spin_14s_linear_infinite]'
          viewBox='0 0 40 40'
          fill='none'
        >
          <polygon points='20,4 36,34 4,34' stroke='white' strokeWidth='2' />
        </svg>
        <svg
          className='absolute right-4 top-4 w-6 h-6 pointer-events-none opacity-15 animate-[spin_9s_linear_infinite_reverse]'
          viewBox='0 0 24 24'
          fill='none'
        >
          <polygon points='12,2 22,20 2,20' stroke='white' strokeWidth='1.5' />
        </svg>

        <h4 className='font-dm-mono text-[11px] font-medium uppercase tracking-[0.15em] mb-0.5 text-white/80'>
          [ Your Notes ]
        </h4>
        <p className='text-[11px] mb-2 text-white/70'>
          Captured from your study sessions
        </p>
        {notes.length === 0 ? (
          <p className='text-[11px] text-white/70'>
            Highlight text in the Wiki to save your first note.
          </p>
        ) : (
          <div className='space-y-1.5'>
            {notes
              .filter((note) => {
                if (note.title === 'Untitled Note' && !note.snippet && !note.updatedAt) return false
                return true
              })
              .map((note) => {
                const displayTitle =
                  note.title === 'Untitled Note' && !note.snippet && note.updatedAt
                    ? `Note from ${new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : note.title
                return (
                  <div key={note.noteId} className='rounded-sm p-2 bg-white/25'>
                    <p className='text-xs font-medium truncate text-white'>
                      {displayTitle}
                    </p>
                    {note.snippet ? (
                      <p className='text-[11px] line-clamp-1 mt-0.5 text-white/70'>
                        {note.snippet}
                      </p>
                    ) : null}
                  </div>
                )
              })}
          </div>
        )}
        <div className='mt-auto flex justify-end'>
          <Link
            href='/dashboard/notes'
            className='text-[11px] font-medium underline underline-offset-2 text-white/90'
          >
            {notes.length > 0
              ? `Open all ${totalNoteCount ?? notes.length} notes →`
              : 'Open notes →'}
          </Link>
        </div>
      </div>

      {/* ── 1/3: 3D Lab (Teal) ──────────────────────────────────────── */}
      <div className='rounded-md p-3 overflow-hidden relative flex flex-col bg-card-lab border border-card-lab-border min-h-0'>
        {/* Animated geometric shape */}
        <div className='absolute right-3 top-3 w-10 h-10 pointer-events-none opacity-20'>
          <div className='w-full h-full border-2 border-white rounded-sm animate-[spin_12s_linear_infinite]' />
          <div className='absolute inset-1 border border-white/60 rounded-sm animate-[spin_8s_linear_infinite_reverse]' />
        </div>

        <div className='flex items-center gap-2 mb-0.5'>
          <h4 className='font-dm-mono text-[11px] font-medium uppercase tracking-[0.15em] text-white/80'>
            [ 3D Lab ]
          </h4>
          <span className='font-dm-mono text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-white/20 text-white/80'>
            Coming Soon
          </span>
        </div>
        <p className='text-[11px] text-white/50 mb-2'>
          Interactive architectural models
        </p>
        <p className='text-xs text-white/70 leading-snug'>
          Coming soon — explore building codes, structural systems, and spatial
          concepts through interactive 3D models you can rotate, cut, and explore.
        </p>

        <div className='mt-auto flex justify-end'>
          <Link
            href='/dashboard/3d-lab'
            className='text-[11px] font-medium text-white/90 underline underline-offset-2'
          >
            Explore 3D Lab →
          </Link>
        </div>
      </div>
    </Card>
  )
}

// ── LabPreviewCard ──────────────────────────────────────────────────────────

export function LabPreviewCard() {
  return (
    <Card className='border-0 p-4 overflow-hidden relative bg-gradient-to-br from-camp-cobalt to-[#2A5BD7]'>
      <div className='flex items-center gap-1.5 mb-0.5'>
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className='text-sm font-semibold text-white cursor-default'>
              3D Lab
            </h3>
          </TooltipTrigger>
          <TooltipContent side='top'>
            SlateCamp&apos;s interactive 3D models let you explore building
            codes and structural systems spatially — not just read about them.
          </TooltipContent>
        </Tooltip>
      </div>
      <p className='text-[11px] text-white/50 mb-3'>
        Interactive architectural models
      </p>

      <p className='text-xs text-white/70 leading-snug mb-3'>
        Explore building codes, structural systems, and spatial concepts through
        interactive 3D models you can rotate, cut, and explore.
      </p>

      {/* CSS animated geometric shape */}
      <div className='absolute right-3 top-3 w-12 h-12 pointer-events-none opacity-20'>
        <div className='w-full h-full border-2 border-white rounded-sm origin-center animate-[spin_12s_linear_infinite]' />
        <div className='absolute inset-1 border border-white/60 rounded-sm animate-[spin_8s_linear_infinite_reverse]' />
      </div>

      <div className='flex justify-end'>
        <Link
          href='/dashboard/3d-lab'
          className='text-[11px] font-medium text-white/90 underline underline-offset-2'
        >
          Explore 3D Lab →
        </Link>
      </div>
    </Card>
  )
}

// ── RecentNotesCard ─────────────────────────────────────────────────────────

interface RecentNotesCardProps {
  notes: NotePreview[]
  totalNoteCount?: number
}

export function RecentNotesCard({
  notes,
  totalNoteCount,
}: RecentNotesCardProps) {
  return (
    <Card className='border border-border p-4 bg-page-bg'>
      <div className='flex items-center gap-1.5 mb-0.5'>
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className='text-sm font-semibold cursor-default text-text-primary'>
              Your Notes
            </h3>
          </TooltipTrigger>
          <TooltipContent side='top'>
            Notes you&apos;ve saved while reading articles in the Wiki or
            reviewing quiz explanations. Everything is tagged to the ALE
            taxonomy automatically.
          </TooltipContent>
        </Tooltip>
      </div>
      <p className='text-[11px] mb-3 text-text-tertiary'>
        Captured from your study sessions
      </p>

      {notes.length === 0 ? (
        <div className='py-3'>
          <p className='text-xs mb-2 text-text-secondary'>
            Your notes workspace is ready. Highlight any text in the Wiki to
            save your first note.
          </p>
          <Link
            href='/dashboard/notes'
            className='text-[11px] font-medium underline underline-offset-2 text-accent-blue'
          >
            Open Notes →
          </Link>
        </div>
      ) : (
        <>
          <div className='space-y-2'>
            {notes.map((note) => (
              <div
                key={note.noteId}
                className='bg-white rounded-sm p-2 border border-border'
              >
                <p className='text-xs font-medium truncate text-text-primary'>
                  {note.title}
                </p>
                <p className='text-[11px] mt-0.5 line-clamp-1 text-text-tertiary'>
                  {note.snippet}
                </p>
              </div>
            ))}
          </div>
          <div className='mt-2 pt-2'>
            <Link
              href='/dashboard/notes'
              className='text-[11px] font-medium underline underline-offset-2 text-accent-blue'
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
    <div className='grid grid-cols-1 md:grid-cols-3 gap-2 w-full'>
      {[1, 2, 3].map((i) => (
        <Card key={i} className='p-4'>
          <Skeleton className='h-4 w-28 mb-1' />
          <Skeleton className='h-3 w-40 mb-3' />
          <Skeleton className='h-12 w-full mb-2' />
          <Skeleton className='h-3 w-24' />
        </Card>
      ))}
    </div>
  )
}
