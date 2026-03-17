'use client'

import React, { useState } from 'react'
import { Note, CircleNotch, CheckCircle } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Button } from '@/components/ui/button'
import { createNote } from '@/lib/actions/notes'
import { useToast } from '@/lib/hooks/use-toast'
import { cn } from '@/lib/utils'

interface WikiNoteActionProps {
  articleId: string
  title: string
  slug: string
}

export function WikiNoteAction({ articleId, title, slug }: WikiNoteActionProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isSaved, setIsCreatingSuccess] = useState(false)
  const { toast } = useToast()

  const handleSaveToNotes = async () => {
    setIsCreating(true)
    try {
      const result = await createNote({
        title: `Notes: ${title}`,
        source_url: `/dashboard/wiki/${slug}`,
        // topic_id could be mapped here if we fetch it
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: `Reference: ` },
                { 
                  type: 'text', 
                  marks: [{ type: 'link', attrs: { href: `/dashboard/wiki/${slug}` } }],
                  text: title 
                }
              ]
            }
          ]
        }
      })

      if ('error' in result) throw new Error(result.error)

      setIsCreatingSuccess(true)
      toast({
        title: "Saved to Notes",
        description: "Article reference added to your workspace."
      })
      
      setTimeout(() => setIsCreatingSuccess(false), 3000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: "Could not add note to your workspace."
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isCreating || isSaved}
      onClick={handleSaveToNotes}
      className={cn(
        "text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-2",
        isSaved && "text-green-600 hover:text-green-600"
      )}
    >
      {isCreating ? (
        <SCIcon icon={CircleNotch} size="xs" className="animate-spin" />
      ) : isSaved ? (
        <SCIcon icon={CheckCircle} size="xs" />
      ) : (
        <SCIcon icon={Note} size="xs" />
      )}
      {isSaved ? 'Saved to Notes' : 'Save to Notes'}
    </Button>
  )
}
