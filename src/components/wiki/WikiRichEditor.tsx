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
  TextB,
  TextItalic,
  TextUnderline,
  HighlighterCircle,
  List as ListIcon,
  ListNumbers,
  ListChecks,
  TextH,
  TextHTwo,
  TextHThree,
  ImageSquare,
  Minus,
} from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { markdownToHtml, htmlToMarkdown } from '@/lib/wiki-markdown'
import { cn } from '@/lib/utils'

interface WikiRichEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  className?: string
}

const EDITOR_CLASS =
  'prose prose-sm prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[180px] px-1 leading-relaxed [&_ul]:list-disc [&_ol]:list-decimal [&_li]:my-0.5 [&_p]:my-3 [&_hr]:my-4 [&_hr]:border-border'

export function WikiRichEditor({
  value,
  onChange,
  placeholder = 'Write markdown...',
  minHeight = '200px',
  className = '',
}: WikiRichEditorProps) {
  const [, setToolbarUpdate] = useState(0)
  const onChangeRef = useRef(onChange)
  const lastEmittedMarkdown = useRef<string | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
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
    content: '<p></p>',
    editorProps: {
      attributes: {
        class: EDITOR_CLASS,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const md = htmlToMarkdown(html)
      lastEmittedMarkdown.current = md
      onChangeRef.current(md)
    },
  })

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Initial content and external value sync: when value prop differs from what we last emitted, load it
  useEffect(() => {
    if (!editor) return
    if (
      lastEmittedMarkdown.current !== null &&
      value === lastEmittedMarkdown.current
    )
      return
    lastEmittedMarkdown.current = value
    markdownToHtml(value).then((html) => {
      editor.commands.setContent(html, { emitUpdate: false })
    })
  }, [value, editor])

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

  const setImage = useCallback(() => {
    const url = window.prompt('Image URL')
    if (url) editor?.chain().focus().setImage({ src: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div
      className={cn(
        'flex flex-col rounded-sm border border-border bg-background',
        className,
      )}
    >
      <div
        className={cn(
          'flex shrink-0 flex-wrap items-center gap-0.5 border-b border-border/60 px-2 py-1.5',
          'bg-muted dark:bg-zinc-800/90',
        )}
      >
        <nav
          className='flex flex-wrap items-center gap-0.5'
          aria-label='Formatting'
        >
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              'rounded p-1.5 transition-colors',
              editor.isActive('bold')
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
            title='Bold'
          >
            <SCIcon icon={TextB} size="xs" />
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              'rounded p-1.5 transition-colors',
              editor.isActive('italic')
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
            title='Italic'
          >
            <SCIcon icon={TextItalic} size="xs" />
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(
              'rounded p-1.5 transition-colors',
              editor.isActive('underline')
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
            title='Underline'
          >
            <SCIcon icon={TextUnderline} size="xs" />
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={cn(
              'rounded p-1.5 transition-colors',
              editor.isActive('highlight')
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
            title='Highlight'
          >
            <SCIcon icon={HighlighterCircle} size="xs" />
          </button>
          <span className='mx-0.5 w-px self-stretch bg-border' aria-hidden />
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              'rounded p-1.5 transition-colors',
              editor.isActive('bulletList')
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
            title='Bullet list'
          >
            <SCIcon icon={ListIcon} size="xs" />
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              'rounded p-1.5 transition-colors',
              editor.isActive('orderedList')
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
            title='Numbered list'
          >
            <SCIcon icon={ListNumbers} size="xs" />
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={cn(
              'rounded p-1.5 transition-colors',
              editor.isActive('taskList')
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
            title='Todo list'
          >
            <SCIcon icon={ListChecks} size="xs" />
          </button>
          <span className='mx-0.5 w-px self-stretch bg-border' aria-hidden />
          <button
            type='button'
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={cn(
              'rounded p-1.5 transition-colors',
              editor.isActive('heading', { level: 1 })
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
            title='Heading 1'
          >
            <SCIcon icon={TextH} size="xs" />
          </button>
          <button
            type='button'
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={cn(
              'rounded p-1.5 transition-colors',
              editor.isActive('heading', { level: 2 })
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
            title='Heading 2'
          >
            <SCIcon icon={TextHTwo} size="xs" />
          </button>
          <button
            type='button'
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={cn(
              'rounded p-1.5 transition-colors',
              editor.isActive('heading', { level: 3 })
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
            title='Heading 3'
          >
            <SCIcon icon={TextHThree} size="xs" />
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className='rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground'
            title='Horizontal line'
          >
            <SCIcon icon={Minus} size="xs" />
          </button>
          <span className='mx-0.5 w-px self-stretch bg-border' aria-hidden />
          <select
            title='Text size'
            value={editor.getAttributes('textStyle').fontSize ?? ''}
            onChange={(e) => {
              const v = e.target.value
              if (v) editor.chain().focus().setFontSize(v).run()
              else editor.chain().focus().unsetFontSize().run()
            }}
            className='h-7 rounded border-0 bg-transparent px-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-border'
          >
            <option value=''>Size</option>
            <option value='12px'>Small</option>
            <option value='16px'>Normal</option>
            <option value='20px'>Large</option>
          </select>
          <button
            type='button'
            onClick={setImage}
            className='rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground'
            title='Insert image'
          >
            <SCIcon icon={ImageSquare} size="xs" />
          </button>
        </nav>
      </div>
      <div className='min-h-[180px] flex-1 px-3 py-2' style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
