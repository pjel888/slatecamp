'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useCallback, useEffect, useState } from 'react'
import { FloppyDisk, CircleNotch, ArrowLeft } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { createArticle, updateArticle } from '@/lib/wiki/wiki-actions'

const EDITOR_CLASS =
  'prose prose-sm prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3'

interface WikiMetadata {
  title: string
  discipline_id: string
  status: 'draft' | 'pending_review' | 'published' | 'archived'
}

interface AdminWikiEditorProps {
  initialContent?: string
  initialMetadata?: WikiMetadata
  articleId?: string
}

export function AdminWikiEditor({
  initialContent = '',
  initialMetadata,
  articleId,
}: AdminWikiEditorProps) {
  const [localMetadata, setLocalMetadata] = useState<WikiMetadata>(
    initialMetadata || {
      title: '',
      discipline_id: '',
      status: 'draft',
    },
  )
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: 'Write your wiki article...' }),
    ],
    content: initialContent,
    editorProps: {
      attributes: { class: EDITOR_CLASS },
    },
  })

  const handleSave = useCallback(async () => {
    if (!editor) return

    setIsSaving(true)
    setSaveError(null)

    try {
      const content = editor.getHTML()
      const result = articleId
        ? await updateArticle(articleId, {
            title: localMetadata.title,
            content,
            discipline_id: localMetadata.discipline_id,
            status: localMetadata.status,
          })
        : await createArticle({
            title: localMetadata.title,
            content,
            discipline_id: localMetadata.discipline_id,
          })

      if (result.success) {
        setLastSaved(new Date())
      } else {
        setSaveError(result.error || 'Failed to save')
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsSaving(false)
    }
  }, [editor, localMetadata, articleId])

  // Auto-save every 30 seconds (debounced)
  useEffect(() => {
    if (!editor || !articleId) return

    const interval = setInterval(() => {
      handleSave()
    }, 30000)

    return () => clearInterval(interval)
  }, [editor, articleId, handleSave])

  return (
    <div className='flex h-full gap-4'>
      {/* Main Editor */}
      <div className='flex-1 flex flex-col rounded-md border border-border bg-background'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border px-4 py-3'>
          <Link
            href='/admin/wiki'
            className='flex items-center gap-2 text-muted-foreground hover:text-foreground'
          >
            <SCIcon icon={ArrowLeft} size='sm' />
          </Link>
          <div className='flex items-center gap-3'>
            {lastSaved && (
              <span className='text-xs text-muted-foreground'>
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {saveError && (
              <span className='text-xs text-red-600'>{saveError}</span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm',
                'bg-primary text-white hover:bg-[#1535A8]',
                'disabled:opacity-50',
              )}
            >
              {isSaving ? (
                <SCIcon icon={CircleNotch} size='sm' className='animate-spin' />
              ) : (
                <SCIcon icon={FloppyDisk} size='sm' />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Title */}
        <div className='border-b border-border px-4 py-3'>
          <input
            type='text'
            value={localMetadata.title}
            onChange={(e) =>
              setLocalMetadata((m) => ({ ...m, title: e.target.value }))
            }
            placeholder='Article title...'
            className='w-full bg-transparent text-xl font-semibold focus:outline-none'
          />
        </div>

        {/* Editor */}
        <div className='flex-1 overflow-auto p-4'>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Side Panel for Metadata */}
      <div className='w-72 shrink-0 rounded-md border border-border bg-background p-4 space-y-6'>
        <div>
          <h3 className='font-semibold mb-4'>Article Settings</h3>

          <div className='space-y-4'>
            {/* Status */}
            <div>
              <label className='text-sm font-medium'>Status</label>
              <select
                value={localMetadata.status}
                onChange={(e) =>
                  setLocalMetadata((m) => ({
                    ...m,
                    status: e.target.value as WikiMetadata['status'],
                  }))
                }
                className='mt-1 w-full rounded-md border border-border px-3 py-2 text-sm'
              >
                <option value='draft'>Draft</option>
                <option value='pending_review'>Pending Review</option>
                <option value='published'>Published</option>
                <option value='archived'>Archived</option>
              </select>
            </div>

            {/* Discipline */}
            <div>
              <label className='text-sm font-medium'>Discipline</label>
              <select
                value={localMetadata.discipline_id}
                onChange={(e) =>
                  setLocalMetadata((m) => ({
                    ...m,
                    discipline_id: e.target.value,
                  }))
                }
                className='mt-1 w-full rounded-md border border-border px-3 py-2 text-sm'
              >
                <option value=''>Select discipline...</option>
                <option value='ale'>Architecture Licensure Exam (ALE)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className='text-sm font-medium mb-3'>Quick Actions</h4>
          <div className='space-y-2'>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className='w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted'
            >
              Save Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
