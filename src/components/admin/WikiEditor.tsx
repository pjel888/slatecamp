'use client'

import * as React from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  FloppyDisk,
  ArrowLeft,
  CircleNotch,
  TextB,
  TextItalic,
  TextStrikethrough,
  ListBullets,
  ListNumbers,
  TextHOne,
  TextHTwo,
  TextHThree,
  Quotes,
  ArrowCounterClockwise,
  ArrowClockwise,
  Code,
  TextT,
} from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { updateWikiArticle, createWikiArticle } from '@/lib/actions/admin/wiki'
import { htmlToMarkdown, markdownToHtml } from '@/lib/wiki-markdown'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface WikiEditorProps {
  article?: {
    id: string
    title: string
    content: string
  }
}

const ToolbarButton = ({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title: string
}) => (
  <button
    onClick={(e) => {
      e.preventDefault()
      onClick()
    }}
    disabled={disabled}
    title={title}
    className={cn(
      'p-2 rounded-md transition-colors',
      isActive
        ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
    )}
  >
    {children}
  </button>
)

const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null

  return (
    <div className='flex flex-wrap items-center gap-1 p-1 border-b bg-zinc-50/50 dark:bg-zinc-900/50 sticky top-0 z-10 backdrop-blur-sm'>
      <div className='flex items-center gap-1 pr-1 border-r border-zinc-200 dark:border-zinc-800'>
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title='Undo'
        >
          <SCIcon icon={ArrowCounterClockwise} size='sm' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title='Redo'
        >
          <SCIcon icon={ArrowClockwise} size='sm' />
        </ToolbarButton>
      </div>

      <div className='flex items-center gap-1 px-1 border-r border-zinc-200 dark:border-zinc-800'>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title='Bold'
        >
          <SCIcon icon={TextB} size='sm' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title='Italic'
        >
          <SCIcon icon={TextItalic} size='sm' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title='Strikethrough'
        >
          <SCIcon icon={TextStrikethrough} size='sm' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title='Inline Code'
        >
          <SCIcon icon={Code} size='sm' />
        </ToolbarButton>
      </div>

      <div className='flex items-center gap-1 px-1 border-r border-zinc-200 dark:border-zinc-800'>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive('heading', { level: 1 })}
          title='Heading 1'
        >
          <SCIcon icon={TextHOne} size='sm' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive('heading', { level: 2 })}
          title='Heading 2'
        >
          <SCIcon icon={TextHTwo} size='sm' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive('heading', { level: 3 })}
          title='Heading 3'
        >
          <SCIcon icon={TextHThree} size='sm' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive('paragraph')}
          title='Paragraph'
        >
          <SCIcon icon={TextT} size='sm' />
        </ToolbarButton>
      </div>

      <div className='flex items-center gap-1 pl-1'>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title='Bullet List'
        >
          <SCIcon icon={ListBullets} size='sm' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title='Ordered List'
        >
          <SCIcon icon={ListNumbers} size='sm' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title='Blockquote'
        >
          <SCIcon icon={Quotes} size='sm' />
        </ToolbarButton>
      </div>
    </div>
  )
}

export function WikiEditor({ article }: WikiEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(article?.title || '')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your article content...',
      }),
    ],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'prose prose-zinc dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-8',
      },
    },
  })

  // Safely initialize editor content once loaded
  React.useEffect(() => {
    if (editor && article?.content) {
      markdownToHtml(article.content).then((html) => {
        if (editor.isEmpty) {
          editor.commands.setContent(html)
        }
      })
    }
  }, [editor, article?.content])

  const handleSave = () => {
    if (!title.trim() || !editor) return

    startTransition(async () => {
      const html = editor.getHTML()
      // CRITICAL: Convert HTML to Markdown to prevent MDX crashes on user wiki
      const content = htmlToMarkdown(html)

      const result = article?.id
        ? await updateWikiArticle(article.id, { title, content })
        : await createWikiArticle({ title, content })

      if (result.error) {
        alert('Error saving: ' + result.error.message)
      } else {
        router.push('/admin/wiki')
        router.refresh()
      }
    })
  }

  return (
    <div className='max-w-5xl mx-auto space-y-8 pb-20'>
      <div className='flex items-center justify-between'>
        <Link
          href='/admin/wiki'
          className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <SCIcon icon={ArrowLeft} size='sm' /> Back to Wiki
        </Link>
        <div className='flex items-center gap-3'>
          <button
            onClick={handleSave}
            disabled={isPending}
            className='flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-[#1535A8] transition-colors disabled:opacity-50'
          >
            {isPending ? (
              <SCIcon icon={CircleNotch} size='sm' className='animate-spin' />
            ) : (
              <SCIcon icon={FloppyDisk} size='sm' />
            )}
            {article?.id ? 'Save Changes' : 'Publish Article'}
          </button>
        </div>
      </div>

      <div className='space-y-4'>
        <input
          type='text'
          placeholder='Article Title...'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className='w-full text-xl font-semibold bg-transparent border-none focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 tracking-tight'
        />
        <div className='h-px bg-zinc-100 dark:bg-zinc-800 w-full' />
      </div>

      <div className='border border-zinc-200 dark:border-zinc-800 rounded-md bg-card overflow-hidden'>
        <EditorToolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
