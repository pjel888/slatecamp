'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
// BubbleMenu is not available in @tiptap/react v3 - using alternative approach
// import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { TextB, TextItalic, TextStrikethrough, List as ListIcon, ListNumbers } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { type Note } from '@/types/app'

interface NoteEditorProps {
  note: Note
  onUpdate: (id: string, content: any, title: string) => void
  isSaving: boolean
}

export function NoteEditor({ note, onUpdate, isSaving }: NoteEditorProps) {
  const [editorReady, setEditorReady] = useState(false);
  const [content, setContent] = useState(note.content)
  const lastUpdated = useRef(note.updated_at)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Typography,
      Placeholder.configure({
        placeholder: 'Start typing...',
        emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-muted-foreground before:float-left before:pointer-events-none',
      }),
    ],
    content: note.content,
    editorProps: {
      attributes: {
        class: 'prose prose-zinc prose-sm sm:prose-base max-w-none focus:outline-none min-h-[calc(100vh-160px)] px-8 py-6 font-serif leading-relaxed text-foreground',
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      
      // Extract title from first line
      const firstNode = json.content?.[0]
      let title = ''
      if (firstNode && firstNode.content) {
        title = firstNode.content.map((c: any) => c.text).join('')
      }
      title = title.slice(0, 50).trim()

      onUpdate(note.id, json, title)
    },
  })

  // Initialize editor once client-side rendering is ready
  useEffect(() => {
    setEditorReady(true);
  }, []);

  // Update editor content when switching notes
  useEffect(() => {
    if (editor && note.updated_at !== lastUpdated.current) {
      const currentContent = JSON.stringify(editor.getJSON())
      const newContent = JSON.stringify(note.content)
      
      if (currentContent !== newContent) {
        editor.commands.setContent(note.content)
      }
      lastUpdated.current = note.updated_at
    }
  }, [note.id, note.updated_at, note.content, editor])

  if (!editorReady || !editor) return null; // Ensure editor is ready before rendering

  return (
    <div className="relative flex flex-1 flex-col bg-card">
      {/* Floating Status Indicator */}
      <div className="absolute top-4 right-6 text-[11px] font-medium text-muted-foreground">
        {isSaving ? 'Saving...' : 'Saved'}
      </div>

      {/* Toolbar for formatting */}
      <div className="flex items-center gap-1 border-b border-border px-4 py-2">
        <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground",
              editor.isActive('bold') && "bg-muted text-foreground"
            )}
          >
            <SCIcon icon={TextB} size="sm" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground",
              editor.isActive('italic') && "bg-muted text-foreground"
            )}
          >
            <SCIcon icon={TextItalic} size="sm" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn(
              "rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground",
              editor.isActive('strike') && "bg-muted text-foreground"
            )}
          >
            <SCIcon icon={TextStrikethrough} size="sm" />
          </button>
          <div className="mx-1 h-4 w-[1px] bg-border" />
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground",
              editor.isActive('bulletList') && "bg-muted text-foreground"
            )}
          >
            <SCIcon icon={ListIcon} size="sm" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground",
              editor.isActive('orderedList') && "bg-muted text-foreground"
            )}
          >
            <SCIcon icon={ListNumbers} size="sm" />
          </button>
        </div>

      {/* Main Editor Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl pt-16 pb-16">
          <div className="mb-8 px-8 text-[11px] text-muted-foreground text-center">
            {new Date(note.updated_at).toLocaleString([], { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric', 
              hour: 'numeric', 
              minute: 'numeric' 
            })}
          </div>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
