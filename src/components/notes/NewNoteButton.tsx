'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createNote } from '@/lib/actions/notes'

interface NewNoteButtonProps {
  className?: string
  children?: React.ReactNode
}

export function NewNoteButton({ className, children }: NewNoteButtonProps) {
  const router = useRouter()

  async function handleClick() {
    const result = await createNote()
    if ('error' in result) return
    router.push(`/dashboard/notes/${result.id}`)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
    >
      {children ?? (
        <>
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          New Note
        </>
      )}
    </button>
  )
}
