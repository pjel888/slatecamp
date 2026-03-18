'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  FolderPlus,
  CaretRight,
  MagnifyingGlass,
  Note,
  Folder,
  CircleNotch,
  Tag,
} from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getNotesList,
  getNoteFolders,
  createNote,
  createNoteFolder,
} from '@/lib/actions/notes-actions'
import { cn } from '@/lib/utils'
import type { NoteStub } from '@/types/app'
import { format } from 'date-fns'
import Link from 'next/link'

interface NotesSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotesSidebar({ open, onOpenChange }: NotesSidebarProps) {
  const [notes, setNotes] = useState<NoteStub[]>([])
  const [folders, setFolders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = async () => {
    setLoading(true)
    try {
      const [nData, fData] = await Promise.all([
        getNotesList(),
        getNoteFolders(),
      ])
      setNotes(nData)
      setFolders(fData)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    setIsCreating(true)
    try {
      const result = await createNote({ title: 'New Note' })
      if ('id' in result) {
        onOpenChange(false)
        // Router navigation should happen here
        window.location.href = `/dashboard/notes/${result.id}`
      }
    } finally {
      setIsCreating(false)
    }
  }

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.snippet?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='w-full sm:max-w-md p-0 flex flex-col gap-0 border-l border-zinc-100'
      >
        <SheetHeader className='p-6 border-b border-zinc-100'>
          <div className='flex items-center justify-between'>
            <SheetTitle className='text-xl font-semibold tracking-tight'>
              Workspace Notes
            </SheetTitle>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 rounded-md'
              >
                <SCIcon icon={FolderPlus} size='sm' className='text-zinc-400' />
              </Button>
              <Button
                size='sm'
                onClick={handleAddNote}
                disabled={isCreating}
                className='h-8 bg-primary text-white hover:bg-[#1535A8] rounded-md px-3 text-xs font-bold'
              >
                {isCreating ? (
                  <SCIcon
                    icon={CircleNotch}
                    size='xs'
                    className='animate-spin'
                  />
                ) : (
                  <SCIcon icon={Plus} size='xs' className='mr-1.5' />
                )}
                New Note
              </Button>
            </div>
          </div>

          <div className='mt-4 relative'>
            <SCIcon
              icon={MagnifyingGlass}
              size='sm'
              className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400'
            />
            <Input
              placeholder='Search your knowledge...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-9 bg-zinc-50 border-zinc-100 focus-visible:ring-zinc-200 h-10 rounded-md'
            />
          </div>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto'>
          {loading ? (
            <div className='flex flex-col items-center justify-center py-20 gap-3'>
              <SCIcon
                icon={CircleNotch}
                size='lg'
                className='animate-spin text-zinc-300'
              />
              <p className='text-xs font-medium text-zinc-400 uppercase tracking-widest'>
                Indexing...
              </p>
            </div>
          ) : notes.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-20 px-12 text-center space-y-4'>
              <div className='w-16 h-16 rounded-md bg-zinc-50 flex items-center justify-center border border-zinc-100'>
                <SCIcon icon={Note} size='xl' className='text-zinc-200' />
              </div>
              <div>
                <p className='font-bold text-zinc-900'>No notes found</p>
                <p className='text-xs text-zinc-500 mt-1'>
                  Start capturing insights from the Wiki or quizzes.
                </p>
              </div>
            </div>
          ) : (
            <div className='divide-y divide-zinc-50'>
              {/* Folders Section */}
              {folders.length > 0 && (
                <div className='p-2'>
                  <p className='px-4 py-2 text-[11px] font-black uppercase tracking-widest text-zinc-400'>
                    Folders
                  </p>
                  {folders.map((folder) => (
                    <button
                      key={folder.folder_id}
                      className='w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 rounded-md transition-colors group'
                    >
                      <SCIcon
                        icon={Folder}
                        size='sm'
                        className='text-amber-500/60'
                      />
                      <span className='text-sm font-medium text-zinc-700'>
                        {folder.name}
                      </span>
                      <SCIcon
                        icon={CaretRight}
                        size='xs'
                        className='ml-auto opacity-0 group-hover:opacity-100 text-zinc-300 transition-opacity'
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Notes List */}
              <div className='p-2'>
                <p className='px-4 py-2 text-[11px] font-black uppercase tracking-widest text-zinc-400'>
                  Recent Notes
                </p>
                {filteredNotes.map((note) => (
                  <Link
                    key={note.id}
                    href={`/dashboard/notes/${note.id}`}
                    onClick={() => onOpenChange(false)}
                    className='flex flex-col gap-1 px-4 py-4 hover:bg-zinc-50 rounded-md transition-colors group'
                  >
                    <div className='flex items-center justify-between'>
                      <h4 className='text-sm font-bold text-zinc-900 group-hover:text-primary transition-colors line-clamp-1'>
                        {note.title}
                      </h4>
                      <span className='text-[11px] font-medium text-zinc-400'>
                        {format(new Date(note.updated_at), 'MMM d')}
                      </span>
                    </div>
                    {note.snippet && (
                      <p className='text-xs text-zinc-500 line-clamp-2 leading-relaxed'>
                        {note.snippet}
                      </p>
                    )}
                    <div className='flex items-center gap-2 mt-1'>
                      <SCIcon icon={Tag} size='xs' className='text-zinc-300' />
                      <span className='text-[11px] font-bold uppercase tracking-tighter text-zinc-400'>
                        Architecture
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
