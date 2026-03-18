'use client'

import { useRouter } from 'next/navigation'
import { Plus } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { ROUTES } from '@/lib/constants/routes'
import { createNote } from '@/lib/actions/notes-actions'

interface NewNoteButtonProps {
  className?: string
  children?: React.ReactNode
}

export function NewNoteButton({ className, children }: NewNoteButtonProps) {
  const router = useRouter()

  async function handleClick() {
    const result = await createNote()
    if ('error' in result) return
    router.push(ROUTES.NOTE(result.id))
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
    >
      {children ?? (
        <>
          <SCIcon icon={Plus} size="sm" />
          New Note
        </>
      )}
    </button>
  )
}
