'use client'

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Bold, Italic, Strikethrough, List, ListOrdered } from 'lucide-react'
import { type Note } from '@/lib/actions/notes-actions'

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
        emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-zinc-400 before:float-left before:pointer-events-none',
      }),
      BubbleMenuExtension,
    ],
    content: note.content,
    editorProps: {
      attributes: {
        class: 'prose prose-zinc prose-sm sm:prose-base max-w-none focus:outline-none min-h-[calc(100vh-160px)] px-8 py-6 font-serif leading-relaxed text-zinc-800',
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

      onUpdate(note.note_id, json, title)
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
  }, [note.note_id, note.updated_at, note.content, editor])

  if (!editorReady || !editor) return null; // Ensure editor is ready before rendering

  return (
    <div className="relative flex flex-1 flex-col bg-white">
      {/* Floating Status Indicator */}
      <div className="absolute top-4 right-6 text-[11px] font-medium text-zinc-400">
        {isSaving ? 'Saving...' : 'Saved'}
      </div>

      {/* Bubble Menu for formatting */}
      {editor && (
        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg shadow-black/5"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "rounded p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              editor.isActive('bold') && "bg-zinc-100 text-zinc-900"
            )}
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "rounded p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              editor.isActive('italic') && "bg-zinc-100 text-zinc-900"
            )}
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn(
              "rounded p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              editor.isActive('strike') && "bg-zinc-100 text-zinc-900"
            )}
          >
            <Strikethrough className="h-4 w-4" />
          </button>
          <div className="mx-1 h-4 w-[1px] bg-zinc-200" />
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "rounded p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              editor.isActive('bulletList') && "bg-zinc-100 text-zinc-900"
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "rounded p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              editor.isActive('orderedList') && "bg-zinc-100 text-zinc-900"
            )}
          >
            <ListOrdered className="h-4 w-4" />
          </button>
        </BubbleMenu>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl pt-16 pb-16">
          <div className="mb-8 px-8 text-[11px] text-zinc-400 text-center">
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
