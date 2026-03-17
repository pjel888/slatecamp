'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import { TextStyle, FontSize } from '@tiptap/extension-text-style'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Highlighter,
  List,
  ListOrdered,
  ListTodo,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { uploadNoteImage } from '@/lib/notes/uploadImage'

type JSONNode = { type: string; content?: JSONNode[]; text?: string }
const DEFAULT_CONTENT: Record<string, unknown> = { type: 'doc', content: [{ type: 'paragraph' }] }

// Highlight colours available in BubbleMenu
const HL_COLOURS = [
  { label: 'Yellow', colour: '#FEF08A' },
  { label: 'Green',  colour: '#BBF7D0' },
  { label: 'Blue',   colour: '#BAE6FD' },
  { label: 'Pink',   colour: '#FBCFE8' },
]

interface NotesEditorProps {
  content: Record<string, unknown> | null
  onChange: (content: Record<string, unknown>) => void
  onTitleChange?: (title: string) => void
  placeholder?: string
  className?: string
  editable?: boolean
  titleSlot?: React.ReactNode
  toolbarWrapperClassName?: string
  agentResult?: string | null
  onAgentResultConsumed?: () => void
  /** Current user ID — required for Storage image uploads */
  userId?: string
  /** When true, collapses toolbar to icon-only strip */
  compact?: boolean
  /** When true, hides the fixed toolbar entirely (rely on BubbleMenu) */
  hideToolbar?: boolean
}

export function NotesEditor({
  content,
  onChange,
  onTitleChange,
  placeholder = 'Write or type / for commands…',
  className,
  editable = true,
  titleSlot,
  toolbarWrapperClassName,
  agentResult,
  onAgentResultConsumed,
  userId,
  compact = false,
  hideToolbar = false,
}: NotesEditorProps) {
  const titleExtracted = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [, setToolbarUpdate] = useState(0)
  const [bubblePos, setBubblePos] = useState<{ top: number; left: number } | null>(null)
  const editorWrapRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder }),
      Image.configure({ inline: false, allowBase64: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      HorizontalRule,
      TextStyle,
      FontSize,
    ],
    content: content && Object.keys(content).length > 0 ? content : DEFAULT_CONTENT,
    editable,
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-neutral max-w-none focus:outline-none min-h-[280px] px-1 font-sans leading-relaxed [&_ul]:list-disc [&_ol]:list-decimal [&_li]:my-0.5 [&_p]:my-3 [&_hr]:my-4 [&_hr]:border-border',
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON() as Record<string, unknown>
      onChange(json)
      if (!titleExtracted.current && onTitleChange) {
        const doc = json as JSONNode
        const firstParagraph = doc.content?.find(
          (n) => n.type === 'paragraph' && n.content?.length
        )
        const text = firstParagraph?.content?.map((n) => n.text ?? '').join('') ?? ''
        const title = text.slice(0, 80).trim() || 'Untitled'
        onTitleChange(title)
        titleExtracted.current = true
      }
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getJSON() as Record<string, unknown>
    const incoming = content && Object.keys(content).length > 0 ? content : DEFAULT_CONTENT
    if (JSON.stringify(current) !== JSON.stringify(incoming)) {
      editor.commands.setContent(incoming, { emitUpdate: false })
    }
  }, [content, editor])

  useEffect(() => {
    if (!editor || !agentResult?.trim()) return
    editor.chain().focus().insertContent('\n\n' + agentResult.trim()).run()
    onAgentResultConsumed?.()
  }, [agentResult, editor, onAgentResultConsumed])

  useEffect(() => {
    if (!editor) return
    const onUpdate = () => {
      setToolbarUpdate((n) => n + 1)
      // Update bubble position based on native selection
      const selection = window.getSelection()
      if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        const wrap = editorWrapRef.current?.getBoundingClientRect()
        if (rect && wrap && rect.width > 0) {
          setBubblePos({
            top: rect.top - wrap.top - 44,
            left: Math.max(0, rect.left - wrap.left + rect.width / 2 - 120),
          })
        }
      } else {
        setBubblePos(null)
      }
    }
    editor.on('selectionUpdate', onUpdate)
    editor.on('transaction', onUpdate)
    return () => {
      editor.off('selectionUpdate', onUpdate)
      editor.off('transaction', onUpdate)
      editor.destroy()
    }
  }, [editor])

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return
    if (userId) {
      try {
        const url = await uploadNoteImage(file, userId)
        editor.chain().focus().setImage({ src: url }).run()
      } catch {
        // Fallback to base64 if upload fails
        const reader = new FileReader()
        reader.onload = (e) => {
          const src = e.target?.result as string
          if (src) editor.chain().focus().setImage({ src }).run()
        }
        reader.readAsDataURL(file)
      }
    } else {
      const reader = new FileReader()
      reader.onload = (e) => {
        const src = e.target?.result as string
        if (src) editor.chain().focus().setImage({ src }).run()
      }
      reader.readAsDataURL(file)
    }
  }, [editor, userId])

  const handleImageButton = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await handleImageUpload(file)
    e.target.value = ''
  }, [handleImageUpload])

  if (!editor) return null

  const toolbarBtn = (active: boolean) =>
    cn(
      'rounded p-2 transition-colors',
      active
        ? 'bg-secondary text-foreground'
        : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
    )

  return (
    <div ref={editorWrapRef} className={cn('relative flex flex-col font-sans', className)}>
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileChange}
        aria-hidden
      />

      {/* Selection BubbleMenu — appears on text selection */}
      {bubblePos && (
        <div
          className="pointer-events-auto absolute z-50 flex items-center gap-0.5 rounded-lg border border-border bg-background px-1.5 py-1 shadow-md"
          style={{ top: bubblePos.top, left: bubblePos.left }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={toolbarBtn(editor.isActive('bold'))} title="Bold">
            <Bold className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={toolbarBtn(editor.isActive('italic'))} title="Italic">
            <Italic className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={toolbarBtn(editor.isActive('underline'))} title="Underline">
            <UnderlineIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <span className="mx-1 w-px self-stretch bg-border" aria-hidden />
          {HL_COLOURS.map(({ label, colour }) => (
            <button
              key={colour}
              type="button"
              onClick={() => editor.chain().focus().toggleHighlight({ color: colour }).run()}
              title={`Highlight ${label}`}
              className={cn(
                'h-5 w-5 rounded-full border-2 transition-transform hover:scale-110',
                editor.isActive('highlight', { color: colour })
                  ? 'border-zinc-500'
                  : 'border-transparent',
              )}
              style={{ backgroundColor: colour }}
            />
          ))}
        </div>
      )}

      {/* Fixed Toolbar */}
      {!hideToolbar && (
        <div
          className={cn(
            'flex shrink-0 flex-wrap items-center gap-0.5 border-b border-border/60 px-3 py-2',
            'bg-muted dark:bg-zinc-800/90',
            toolbarWrapperClassName,
          )}
        >
          <nav className="flex flex-wrap items-center gap-0.5" aria-label="Formatting">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={toolbarBtn(editor.isActive('bold'))} title="Bold">
              <Bold className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={toolbarBtn(editor.isActive('italic'))} title="Italic">
              <Italic className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={toolbarBtn(editor.isActive('underline'))} title="Underline">
              <UnderlineIcon className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleHighlight().run()} className={toolbarBtn(editor.isActive('highlight'))} title="Highlight">
              <Highlighter className="h-4 w-4" strokeWidth={1.5} />
            </button>

            {!compact && (
              <>
                <span className="mx-1 w-px self-stretch bg-border" aria-hidden />
                <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={toolbarBtn(editor.isActive('bulletList'))} title="Bullet list">
                  <List className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={toolbarBtn(editor.isActive('orderedList'))} title="Numbered list">
                  <ListOrdered className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleTaskList().run()} className={toolbarBtn(editor.isActive('taskList'))} title="Todo list">
                  <ListTodo className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <span className="mx-1 w-px self-stretch bg-border" aria-hidden />
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={toolbarBtn(editor.isActive('heading', { level: 1 }))} title="Heading 1">
                  <Heading1 className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={toolbarBtn(editor.isActive('heading', { level: 2 }))} title="Heading 2">
                  <Heading2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={toolbarBtn(editor.isActive('heading', { level: 3 }))} title="Heading 3">
                  <Heading3 className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className="rounded p-2 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground" title="Horizontal rule">
                  <Minus className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <span className="mx-1 w-px self-stretch bg-border" aria-hidden />
                <select
                  title="Text size"
                  value={editor.getAttributes('textStyle').fontSize ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v) editor.chain().focus().setFontSize(v).run()
                    else editor.chain().focus().unsetFontSize().run()
                  }}
                  className="h-8 rounded border-0 bg-transparent px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-border"
                >
                  <option value="">Size</option>
                  <option value="12px">Small</option>
                  <option value="16px">Normal</option>
                  <option value="20px">Large</option>
                </select>
              </>
            )}

            <button type="button" onClick={handleImageButton} className="rounded p-2 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground" title="Insert image">
              <ImagePlus className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </nav>
        </div>
      )}

      {titleSlot && (
        <div className="shrink-0 border-b border-border/60 bg-background px-4 py-2">
          {titleSlot}
        </div>
      )}

      <div className="min-h-[280px] flex-1 p-4 bg-background">
        <EditorContent editor={editor} />
      </div>

    </div>
  )
}
