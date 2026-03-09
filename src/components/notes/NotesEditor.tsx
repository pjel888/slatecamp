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
import { TextStyle } from '@tiptap/extension-text-style/text-style'
import { FontSize } from '@tiptap/extension-text-style/font-size'
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

type JSONNode = { type: string; content?: JSONNode[]; text?: string }
const DEFAULT_CONTENT: Record<string, unknown> = { type: 'doc', content: [{ type: 'paragraph' }] }

interface NotesEditorProps {
  content: Record<string, unknown> | null
  onChange: (content: Record<string, unknown>) => void
  onTitleChange?: (title: string) => void
  placeholder?: string
  className?: string
  editable?: boolean
  /** Rendered between the toolbar and the editor (e.g. note title input). */
  titleSlot?: React.ReactNode
  /** Optional class for the toolbar wrapper (e.g. full-bleed and custom background). */
  toolbarWrapperClassName?: string
  /** When set, insert this text at the end of the document (e.g. from Study Agent). */
  agentResult?: string | null
  onAgentResultConsumed?: () => void
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
}: NotesEditorProps) {
  const titleExtracted = useRef(false)
  const [, setToolbarUpdate] = useState(0)
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
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
        class: 'prose prose-sm prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[280px] px-1 leading-relaxed [&_ul]:list-disc [&_ol]:list-decimal [&_li]:my-0.5 [&_p]:my-3 [&_hr]:my-4 [&_hr]:border-border',
      },
      handleKeyDown: (view, event) => {
        if (event.key === '/') {
          const { state } = view
          const { $from } = state.selection
          const textBefore = $from.parent.textContent.slice(0, $from.parentOffset)
          if (textBefore === '' || /^\s+$/.test(textBefore)) {
            event.preventDefault()
            const tr = state.tr.insertText('/')
            view.dispatch(tr)
            return true
          }
        }
        return false
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
    const onUpdate = () => setToolbarUpdate((n) => n + 1)
    editor.on('selectionUpdate', onUpdate)
    editor.on('transaction', onUpdate)
    return () => {
      editor.off('selectionUpdate', onUpdate)
      editor.off('transaction', onUpdate)
      editor.destroy()
    }
  }, [editor])

  const setLink = useCallback(() => {
    const url = window.prompt('Image URL')
    if (url) editor?.chain().focus().setImage({ src: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Toolbar in top strip: shade between sidebar and note content */}
      <div
        className={cn(
          'flex shrink-0 flex-wrap items-center gap-0.5 border-b border-border/60 px-3 py-2',
          'bg-muted dark:bg-zinc-800/90',
          toolbarWrapperClassName
        )}
      >
        <nav className="flex flex-wrap items-center gap-0.5" aria-label="Formatting">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn('rounded p-2 transition-colors', editor.isActive('bold') ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground')}
          title="Bold"
        >
          <Bold className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn('rounded p-2 transition-colors', editor.isActive('italic') ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground')}
          title="Italic"
        >
          <Italic className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn('rounded p-2 transition-colors', editor.isActive('underline') ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground')}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={cn('rounded p-2 transition-colors', editor.isActive('highlight') ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground')}
          title="Highlight"
        >
          <Highlighter className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <span className="mx-1 w-px self-stretch bg-border" aria-hidden />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn('rounded p-2 transition-colors', editor.isActive('bulletList') ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground')}
          title="Bullet list"
        >
          <List className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn('rounded p-2 transition-colors', editor.isActive('orderedList') ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground')}
          title="Numbered list"
        >
          <ListOrdered className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={cn('rounded p-2 transition-colors', editor.isActive('taskList') ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground')}
          title="Todo list"
        >
          <ListTodo className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <span className="mx-1 w-px self-stretch bg-border" aria-hidden />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn('rounded p-2 transition-colors', editor.isActive('heading', { level: 1 }) ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground')}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn('rounded p-2 transition-colors', editor.isActive('heading', { level: 2 }) ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground')}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn('rounded p-2 transition-colors', editor.isActive('heading', { level: 3 }) ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground')}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="rounded p-2 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          title="Horizontal line"
        >
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
        <button
          type="button"
          onClick={setLink}
          className="rounded p-2 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          title="Insert image"
        >
          <ImagePlus className="h-4 w-4" strokeWidth={1.5} />
        </button>
        </nav>
      </div>
      {titleSlot && <div className="shrink-0 border-b border-border/60 bg-background px-4 py-2">{titleSlot}</div>}
      <div className="min-h-[280px] flex-1 p-4 bg-background">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
