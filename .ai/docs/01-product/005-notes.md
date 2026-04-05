# Notes System

**Analysis Date:** 2026-04-06

## Overview

SlateCamp's notes system provides contextually anchored note-taking for ALE preparation. Notes are stored as TipTap JSONB, enabling rich text with embedded formatting, and can be anchored to specific study objects (topics, questions, sessions, articles).

**Source:** `src/components/notes/` (9 files), `src/lib/notes/`, `src/types/app.ts`

## Note Types

```typescript
type NoteType = 'standard' | 'quick_capture' | 'cornell' | 'gap_analysis';
```

| Type | Description |
|------|-------------|
| `standard` | Free-form rich text notes |
| `quick_capture` | Rapid capture during study sessions |
| `cornell` | Cornell method layout (cue, notes, summary) |
| `gap_analysis` | Comparison/contrast structured notes |

**Source:** `src/types/app.ts` (line 626)

## Note Structure

```typescript
interface Note {
  id: string;
  user_id: string;
  folder_id?: string | null;
  topic_id?: string | null;       // Anchored to taxonomy node
  question_id?: string | null;     // Anchored to specific question
  session_id?: string | null;     // Anchored to study session
  article_id?: string | null;       // Anchored to wiki article
  title: string;
  content: Record<string, unknown>; // TipTap JSONB
  note_type: NoteType;
  is_pinned: boolean;
  tags: string[];
  color?: string | null;
  source_url?: string | null;
  created_at: string;
  updated_at: string;
}

interface NoteStub {
  // Lightweight preview for listing views
  id: string;
  title: string;
  updated_at: string;
  is_pinned: boolean;
  note_type: NoteType;
  topic_id?: string | null;
  question_id?: string | null;
  article_id?: string | null;
  tags: string[];
  color?: string | null;
  snippet?: string;         // Content preview
  is_virtual?: boolean;    // Not persisted to DB
}
```

**Source:** `src/types/app.ts` (lines 626–659)

## Contextual Anchoring

Notes can be anchored to multiple contexts simultaneously:

| Anchor | Use Case |
|--------|----------|
| `topic_id` | Notes about a specific ALE topic |
| `question_id` | Notes explaining a specific question |
| `session_id` | Session-specific reflections |
| `article_id` | Notes linked to a wiki article |

**Source:** `src/lib/notes/` (persistence logic)

## Editor

TipTap-based rich text editor:
- JSONB storage (not HTML)
- Extensions: bold, italic, headings, lists, code blocks, links, images
- Custom extensions for ALE-specific content (code citations, formula blocks)
- Toolbar in `NoteEditorToolbar.tsx`

**Source:** `src/components/notes/NoteEditor.tsx`, `src/components/notes/Toolbar.tsx`

## Note Management Routes

| Route | Purpose |
|-------|---------|
| `/dashboard/notes` | Note list, folder navigation, search |
| `/dashboard/notes/[id]` | Note detail/edit view |

**Source:** `src/app/dashboard/notes/`

## Templates

Pre-built note templates for common ALE study patterns:
- Cornell method template
- Gap analysis template
- Formula reference template
- Case study template

**Source:** `src/components/notes/templates/`

## Sync & Persistence

Notes sync to Supabase with debouncing to reduce write frequency:
- Debounce delay: ~500ms after last keystroke
- Image uploads handled separately via `src/lib/notes/image-upload.ts`
- Optimistic UI updates in editor

**Source:** `src/lib/notes/sync.ts`, `src/lib/notes/`

## Integration Points

### Wiki Articles
Notes can anchor to wiki articles for topic-specific study notes.

### Quiz Sessions
Post-session reflection notes attached to session context.

### 3D Lab
Spatial study notes linked to 3D model contexts.

**Source:** `src/types/app.ts` (Note interface), `src/components/notes/`

---

*Notes system analysis: 2026-04-06*
