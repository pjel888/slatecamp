<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# notes

## Purpose

Note-taking system for SlateCamp students. Provides a full-height split-pane interface with a note navigator (list/search/filter) on the left and a Tiptap-based rich text editor on the right. Notes can be linked to wiki articles, quiz questions, or taxonomy topics. Supports pinning, tagging, color-coding, and folder organization. Data is fetched server-side and passed to the client-side `NotesShell` component for interactive editing.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Simple full-height wrapper (`h-full w-full overflow-hidden`) -- no SharedPageLayout since notes needs full viewport control |
| `loading.tsx` | Skeleton loading state with navigator and editor placeholders |
| `page.tsx` | Server Component -- fetches user's notes (with metadata) and folders from Supabase, maps to `NoteStub[]`, renders `NotesShell` with initial data and optional `?open=noteId` param for deep linking |

## Subdirectories

None -- all note-related UI components live in `@/components/notes/`.

## For AI Agents

### Working In This Directory

- **Server-to-client handoff:** The page fetches all note stubs and folders server-side, then passes them as props to the client-side `NotesShell`. This avoids client-side loading spinners on initial page load.
- **Deep linking:** The `?open=noteId` search param allows direct navigation to a specific note (e.g., from a quiz question or wiki article link).
- **Note types:** Notes have a `note_type` field (`standard` and potentially others). Each note can optionally link to an `article_id`, `question_id`, or `topic_id` for cross-referencing with wiki articles, quiz questions, or taxonomy topics.
- **Data shape:** Notes are mapped to `NoteStub` type (from `@/types/app`) with `id`, `title`, `updated_at`, `is_pinned`, `note_type`, `tags`, `color`, `article_id`, `question_id`, `topic_id`, and `snippet` (truncated content preview via `snippet()` utility).
- **Sorting:** Notes are fetched sorted by `is_pinned` (descending) then `updated_at` (descending) -- pinned notes always appear first.
- **Folders:** Note folders are fetched separately from the `note_folders` table and sorted alphabetically by name.
- **Layout constraint:** Like 3D Lab, Notes uses a full-height layout without `SharedPageLayout` because the split-pane editor needs the full viewport height chain.
- **Rich text editor:** The actual editor component (`NotesEditor`) uses Tiptap for rich text editing with markdown support.

### Testing Requirements

- Verify notes load correctly with pinned notes appearing first
- Test deep linking via `?open=noteId` search param
- Confirm folder organization and filtering works
- Test note creation, editing, saving, and deletion
- Verify cross-reference links (article_id, question_id, topic_id) navigate correctly
- Test empty state when user has no notes

### Common Patterns

- **Parallel data fetching** with `Promise.all` for notes and folders
- **Snippet generation** via `snippet()` from `@/lib/utils/text` for note preview text
- **Full-height layout** with `overflow-hidden` for split-pane scrolling control
- **Async searchParams** with `Promise<{ open?: string }>` (Next.js 15+ pattern)

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/supabase/server` | `createClient`, `getUser` for server-side auth and data fetching |
| `@/lib/utils/text` | `snippet()` for truncating note content to preview text |
| `@/types/app` | `NoteStub` type definition |
| `@/components/notes/NotesShell` | Client-side shell with navigator + editor split pane |
| `@/components/notes/NotesEditor` | Tiptap-based rich text editor |
| `@/components/notes/NotesNavigator` | Note list with search, filter, and folder navigation |

### External

| Package | Purpose |
|---------|---------|
| `@tiptap/react` | Rich text editor framework |
| `@tiptap/starter-kit` | Basic editor extensions (bold, italic, lists, etc.) |
| `@supabase/supabase-js` | Database queries for notes and folders |

<!-- MANUAL: -->
