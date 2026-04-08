'use client'

import * as React from 'react'
import { HighlighterCircle, Copy, NotePencil } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { useNoteContext } from '@/lib/context/note-context'
import { addWikiHighlight } from '@/lib/actions/wiki-interactions'
import { useToast } from '@/lib/hooks/use-toast'

/**
 * Text-selection popover that appears when the user highlights text
 * in the wiki article. Offers: Highlight, Copy, Add to Notes.
 */
export function WikiTextSelection({ articleId }: { articleId?: string }) {
  const { anchor, openDrawer } = useNoteContext()
  const { toast } = useToast()
  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null)
  const [selectedText, setSelectedText] = React.useState('')
  const popoverRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setPosition(null)
        setSelectedText('')
        return
      }

      const text = selection.toString().trim()
      if (text.length < 3) return

      // Check if selection is within the wiki center pane
      const anchorNode = selection.anchorNode
      const centerPane = document.getElementById('wiki-center-pane')
      if (!centerPane || !anchorNode || !centerPane.contains(anchorNode)) {
        setPosition(null)
        return
      }

      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      setSelectedText(text)
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
      })
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [])

  // Hide on click outside
  React.useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        // Let the selection change handler deal with it
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText)
    setPosition(null)
    window.getSelection()?.removeAllRanges()
  }

  const handleHighlight = async () => {
    if (articleId && selectedText) {
      const success = await addWikiHighlight(articleId, selectedText)
      if (success) {
        toast({
          title: 'Text highlighted',
          description: 'This highlight has been saved to your profile.',
        })
      }
    }
    setPosition(null)
    window.getSelection()?.removeAllRanges()
  }

  const handleAddToNotes = () => {
    openDrawer({
      ...anchor,
      initialText: selectedText
    })
    setPosition(null)
    window.getSelection()?.removeAllRanges()
  }

  if (!position) return null

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 -translate-x-1/2 -translate-y-full"
      style={{ left: position.x, top: position.y }}
    >
      <div role="toolbar" aria-label="Text selection actions" className="flex items-center gap-0.5 bg-foreground text-background rounded-md shadow-lg px-1 py-0.5">
        <button
          onClick={handleHighlight}
          className="flex items-center gap-1 px-2 py-1.5 text-xs hover:bg-foreground/80 rounded transition-colors"
          aria-label="Highlight selected text"
        >
          <SCIcon icon={HighlighterCircle} size="xs" />
          <span>Highlight</span>
        </button>
        <div className="w-px h-4 bg-background/20" aria-hidden="true" />
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1.5 text-xs hover:bg-foreground/80 rounded transition-colors"
          aria-label="Copy selected text"
        >
          <SCIcon icon={Copy} size="xs" />
          <span>Copy</span>
        </button>
        <div className="w-px h-4 bg-background/20" aria-hidden="true" />
        <button
          onClick={handleAddToNotes}
          className="flex items-center gap-1 px-2 py-1.5 text-xs hover:bg-foreground/80 rounded transition-colors"
          aria-label="Add selected text to notes"
        >
          <SCIcon icon={NotePencil} size="xs" />
          <span>Note</span>
        </button>
      </div>
      {/* Arrow */}
      <div className="w-2 h-2 bg-foreground rotate-45 mx-auto -mt-1" />
    </div>
  )
}
