<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# notes

## Purpose

Note-taking system using TipTap rich text editor. Provides markdown-like editing with formatting toolbar, note organization via folders, search, and auto-save. Notes capture insights from quizzes and Wiki content for spaced repetition review.

## Key Files

| File | Description |
|------|-------------|
| `NotesEditor.tsx` | TipTap editor with formatting toolbar (bold, italic, strikethrough, lists), bubble menu, highlights, images, task lists, headings, font sizes. `'use client'` |
| `NoteEditor.tsx` | Wrapper showing single note with auto-save indicator and edit controls. `'use client'` |
| `NotesShell.tsx` | Main shell/layout for notes workspace (sidebar + editor). `'use client'` |
| `NotesList.tsx` | Renderable list of notes (for sidebar or standalone). `'use client'` |
| `NotesNavigator.tsx` | Navigation component for moving between notes. `'use client'` |
| `QuickCaptureDrawer.tsx` | Drawer for quick note capture (side-panel). `'use client'` |
| `TemplatePicker.tsx` | Template selection modal for new notes. `'use client'` |
| `ContextBadge.tsx` | Badge showing note context source (Quiz, Wiki, etc.). |

## Subdirectories

None. All notes components are flat in `src/components/notes/`.

## For AI Agents

### Working In This Directory

- **Editor**: Uses TipTap v3 with StarterKit, Placeholder, Typography, Image, TaskList, Highlight extensions
- **Bubble Menu**: Shows on text selection with bold, italic, underline, highlight color picker
- **Fixed Toolbar**: Optional, can be hidden with `hideToolbar` prop; includes formatting + image upload
- **Auto-save**: Debounced with 10-second persistence target (see project rules)
- **Title Extraction**: Automatically extracted from first paragraph on first edit (max 80 chars)
- **Image Upload**: Supports local base64 or Supabase Storage integration (needs userId)
- **Search**: Server-side via `getNotesList()` action with client-side filtering
- **Folders**: Optional folder organization; loaded async on sidebar open
- **Highlight Colors**: Yellow #FEF08A, Green #BBF7D0, Blue #BAE6FD, Pink #FBCFE8
- **Styling**: Prose classes for typography (prose-sm on compact, full prose-base on desktop)

### Dependencies
### Internal

- `@tiptap/react` - Editor core
- `@tiptap/starter-kit` - Basic formatting (bold, italic, strike, headings, lists, blockquote, code, hr)
- `@tiptap/extension-*` - Underline, Highlight, Placeholder, Image, TaskList, TextStyle, FontSize, HorizontalRule
- `@/lib/actions/notes-actions` - Server actions: `getNotesList`, `getNoteFolders`, `createNote`, `createNoteFolder`
- `@/lib/notes/uploadImage` - Image upload to Supabase Storage
- `@/lib/utils` - `cn()` utility
- `@phosphor-icons/react` - Icons (Plus, Folder, Note, Search, etc.)
- `date-fns` - Date formatting
- UI components from `@/components/ui/` - Sheet, Button, Input

<!-- MANUAL: Update image upload domain/bucket when Supabase Storage is configured. Ensure fallback to base64 works if upload fails. Monitor auto-save debounce -- adjust if latency issues arise. -->
