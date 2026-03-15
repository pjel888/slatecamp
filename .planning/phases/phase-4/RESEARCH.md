# Phase 4: Admin & Content Operations - Research

**Researched:** March 15, 2026
**Domain:** Admin dashboard, content management, role-based access control
**Confidence:** HIGH

## Summary

Phase 4 implements "The Control Room" - an internal admin dashboard for content management without touching the codebase. The implementation leverages Supabase RLS for database-level access control, TipTap for rich text editing, PostgreSQL triggers for audit logging, and a state machine pattern for SME review workflows.

**Primary recommendation:** Use the existing TipTap configuration pattern from `WikiRichEditor.tsx`, extend `is-admin.ts` to check the `user_roles` table, and implement audit logging via database triggers for reliability.

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
| Decision | Value |
|----------|-------|
| Role Storage | Database table (`user_roles`) |
| Primary Gate | RLS (database-level enforcement) |
| Sub-roles | `super_admin`, `content_admin`, `sme_reviewer` |
| Mutability | Mutable via UI (super_admin can grant/revoke) |
| Bulk Import | Both CSV and JSON, strict validation (all or nothing) |
| CSV Structure | Denormalized columns |
| Wiki Editor | Separate from student WikiRichEditor, side panel for metadata |
| Content States | draft → pending_review → published → archived |
| Audit Events | CREATE, UPDATE, DELETE, PUBLISH, VIEW, EXPORT |
| Audit Storage | Hybrid (JSONB for content, normalized for metadata) |
| Notifications | In-app only (bell icon) |
| Workflow States | draft → pending_review → changes_requested → approved → published |

### Claude's Discretion
- Auto-save interval (30 seconds) - flexible based on UX testing
- Specific UI component library - use existing shadcn/ui patterns

### Deferred Ideas (OUT OF SCOPE)
- Email notifications for SMEs
- Bulk export functionality
- Content versioning/rollback UI
- AI-assisted content suggestions

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| REQ-4.1 | Admin role-based access with user_roles table | RLS policies + is-admin.ts extension |
| REQ-4.2 | Bulk CSV/JSON import for questions | papaparse + validation patterns |
| REQ-4.3 | Admin wiki editor with TipTap | TipTap extensions + side panel pattern |
| REQ-4.4 | Audit logging for all admin operations | PostgreSQL trigger-based logging |
| REQ-4.5 | SME review workflow with state machine | State transitions + notification patterns |

</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `papaparse` | ^5.4.1 | CSV parsing | Industry standard for CSV in JS, TypeScript support |
| `@tiptap/*` | ^3.20.1 | Rich text editing | Already in use (WikiRichEditor, NotesEditor) |
| `@supabase/ssr` | ^0.9.0 | Middleware auth | Already in project |
| `@supabase/supabase-js` | ^2.98.0 | Database client | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` | ^4.3.6 | Validation schemas | Validating imported question data |
| `lucide-react` | ^0.577.0 | Icons | Already in project (bell, save, etc.) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| papaparse | csv-parse | More modular, but papaparse has better TypeScript types |
| Custom state machine | xstate | XState is powerful but adds complexity for simple workflow |
| Email notifications | Supabase realtime | Not in scope per CONTEXT.md |

**Installation:**
```bash
npm install papaparse @types/papaparse
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── admin/
│   │   ├── AdminWikiEditor.tsx    # TipTap with side panel
│   │   ├── QuestionImporter.tsx  # CSV/JSON import
│   │   ├── AuditLogViewer.tsx    # Read-only audit viewer
│   │   ├── SMEReviewQueue.tsx    # Workflow management
│   │   └── RoleManager.tsx       # User role assignment
│   └── shared/
│       └── AdminLayout.tsx        # Admin route layout
├── lib/
│   ├── admin/
│   │   ├── is-admin.ts           # Extended role checks
│   │   ├── roles.ts              # Role types and helpers
│   │   └── permissions.ts        # Permission definitions
│   ├── audit/
│   │   └── audit-log.ts          # Audit query helpers
│   └── workflow/
│       └── content-workflow.ts    # State machine
├── app/
│   └── admin/
│       ├── page.tsx              # Dashboard
│       ├── questions/
│       ├── wiki/
│       ├── users/
│       └── audit/
└── supabase/
    └── migrations/
        ├── add-user-roles.sql
        ├── add-audit-logs.sql
        └── add-content-status.sql
```

### Pattern 1: Role-Based RLS Policy

**What:** Database-level access control using Supabase RLS policies that check the `user_roles` table.

**When to use:** Any table that needs admin-only or role-based access.

**Example:**
```sql
-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'content_admin', 'sme_reviewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own roles
CREATE POLICY "Users can read own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'content_admin')
  );
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policy for admin-only tables
CREATE POLICY "Admins can manage questions"
  ON public.questions
  FOR ALL
  TO authenticated
  USING (public.has_admin_role())
  WITH CHECK (public.has_admin_role());
```

**Source:** Supabase official docs - Custom Claims & RBAC

### Pattern 2: CSV Import with Validation

**What:** Parse CSV/JSON files client-side, validate all records, insert in single transaction.

**When to use:** Bulk question import requiring strict validation.

**Example:**
```typescript
// src/lib/import/question-importer.ts
import Papa from 'papaparse';
import { z } from 'zod';

const QuestionSchema = z.object({
  taxonomy_node_id: z.string().uuid(),
  question_text: z.string().min(10).max(2000),
  option_a: z.string().min(1).max(500),
  option_b: z.string().min(1).max(500),
  option_c: z.string().min(1).max(500),
  option_d: z.string().min(1).max(500),
  option_e: z.string().min(1).max(500),
  correct_answer: z.enum(['a', 'b', 'c', 'd', 'e']),
  rationale: z.string().max(2000).optional(),
  difficulty: z.number().min(1).max(5),
});

type QuestionImport = z.infer<typeof QuestionSchema>;

interface ImportResult {
  success: boolean;
  validQuestions: QuestionImport[];
  errors: { row: number; message: string }[];
}

export function parseCSV(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const errors: { row: number; message: string }[] = [];
        const validQuestions: QuestionImport[] = [];

        results.data.forEach((row: unknown, index: number) => {
          const result = QuestionSchema.safeParse(row);
          if (result.success) {
            validQuestions.push(result.data);
          } else {
            errors.push({
              row: index + 2, // +2 for header and 0-index
              message: result.error.errors.map(e => e.message).join('; '),
            });
          }
        });

        // Strict validation: reject entire batch on any error
        resolve({
          success: errors.length === 0,
          validQuestions,
          errors,
        });
      },
      error: (error) => {
        resolve({
          success: false,
          validQuestions: [],
          errors: [{ row: 0, message: error.message }],
        });
      },
    });
  });
}

export async function importQuestions(
  questions: QuestionImport[],
  supabase: SupabaseClient
) {
  // Convert to database format
  const records = questions.map(q => ({
    topic_id: q.taxonomy_node_id,
    text: q.question_text,
    options: [q.option_a, q.option_b, q.option_c, q.option_d, q.option_e],
    correct_option_id: q.correct_answer,
    rationale: q.rationale,
    difficulty: q.difficulty,
  }));

  // Single transaction - all or nothing
  const { error } = await supabase
    .from('questions')
    .insert(records);

  if (error) throw error;
}
```

### Pattern 3: Admin Wiki Editor with Side Panel

**What:** TipTap editor extended with a side panel for metadata (taxonomy, status, author).

**When to use:** Admin content management requiring rich text editing.

**Example:**
```typescript
// src/components/admin/AdminWikiEditor.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useDebouncedCallback } from 'use-debounce';
import { Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Reuse existing TipTap config pattern
const EDITOR_CLASS = 'prose prose-sm prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3';

interface WikiMetadata {
  title: string;
  discipline_id: string;
  node_ids: string[];
  status: 'draft' | 'pending_review' | 'published' | 'archived';
  author_id: string;
}

interface AdminWikiEditorProps {
  initialContent?: string;
  metadata?: WikiMetadata;
  onSave: (content: string, metadata: WikiMetadata) => Promise<void>;
  onAutoSave?: (content: string) => void;
}

export function AdminWikiEditor({
  initialContent = '',
  metadata,
  onSave,
  onAutoSave,
}: AdminWikiEditorProps) {
  const [localMetadata, setLocalMetadata] = useState<WikiMetadata>(
    metadata || {
      title: '',
      discipline_id: '',
      node_ids: [],
      status: 'draft',
      author_id: '',
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: 'Write your wiki article...' }),
      // Add other extensions as needed
    ],
    content: initialContent,
    editorProps: {
      attributes: { class: EDITOR_CLASS },
    },
  });

  // Auto-save every 30 seconds
  const handleAutoSave = useDebouncedCallback(async (content: string) => {
    if (onAutoSave) {
      onAutoSave(content);
    }
  }, 30000);

  useEffect(() => {
    if (editor && onAutoSave) {
      const unsubscribe = editor.on('update', ({ editor }) => {
        handleAutoSave(editor.getHTML());
      });
      return unsubscribe;
    }
  }, [editor, handleAutoSave, onAutoSave]);

  const handleSave = useCallback(async () => {
    if (!editor) return;
    setIsSaving(true);
    try {
      await onSave(editor.getHTML(), localMetadata);
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  }, [editor, localMetadata, onSave]);

  return (
    <div className="flex h-full gap-4">
      {/* Main Editor */}
      <div className="flex-1 flex flex-col rounded-lg border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <input
            type="text"
            value={localMetadata.title}
            onChange={(e) => setLocalMetadata(m => ({ ...m, title: e.target.value }))}
            placeholder="Article title..."
            className="flex-1 bg-transparent text-lg font-semibold focus:outline-none"
          />
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-muted-foreground">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm",
                "bg-blue-600 text-white hover:bg-blue-700",
                "disabled:opacity-50"
              )}
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Side Panel for Metadata */}
      <div className="w-72 shrink-0 rounded-lg border border-border bg-background p-4">
        <h3 className="mb-4 font-semibold">Article Settings</h3>
        
        <div className="space-y-4">
          {/* Status */}
          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              value={localMetadata.status}
              onChange={(e) => setLocalMetadata(m => ({ 
                ...m, 
                status: e.target.value as WikiMetadata['status'] 
              }))}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Discipline */}
          <div>
            <label className="text-sm font-medium">Discipline</label>
            <select
              value={localMetadata.discipline_id}
              onChange={(e) => setLocalMetadata(m => ({ 
                ...m, 
                discipline_id: e.target.value 
              }))}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            >
              <option value="">Select discipline...</option>
              {/* Populate from disciplines table */}
            </select>
          </div>

          {/* Taxonomy Tree Picker */}
          <div>
            <label className="text-sm font-medium">Taxonomy Tags</label>
            <div className="mt-1 rounded-md border border-border p-2">
              {/* Tree picker component */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Pattern 4: Trigger-Based Audit Logging

**What:** PostgreSQL triggers automatically log all changes to an audit table with JSONB for diffs.

**When to use:** Compliance, debugging, and security tracking of admin operations.

**Example:**
```sql
-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'VIEW', 'EXPORT')),
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  content_snapshot JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_content_gin ON audit_logs USING gin(content_snapshot jsonb_path_ops);

-- Enable RLS (read-only for super_admin, inserts via trigger)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  audit_row audit_logs%ROWTYPE;
  changed_fields TEXT[] := NULL;
BEGIN
  audit_row.actor_id := auth.uid();
  audit_row.table_name := TG_TABLE_NAME;
  audit_row.created_at := NOW();
  
  IF TG_OP = 'INSERT' THEN
    audit_row.event_type := 'CREATE';
    audit_row.record_id := NEW.id;
    audit_row.content_snapshot := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    audit_row.event_type := 'UPDATE';
    audit_row.record_id := NEW.id;
    audit_row.content_snapshot := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    );
    
    -- Track changed fields
    IF OLD IS NOT NULL AND NEW IS NOT NULL THEN
      changed_fields := ARRAY(
        SELECT key
        FROM jsonb_object_keys(to_jsonb(NEW)) AS key
        WHERE to_jsonb(NEW) ->> key IS DISTINCT FROM to_jsonb(OLD) ->> key
      );
      audit_row.metadata := jsonb_build_object('changed_fields', changed_fields);
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    audit_row.event_type := 'DELETE';
    audit_row.record_id := OLD.id;
    audit_row.content_snapshot := to_jsonb(OLD);
  END IF;
  
  INSERT INTO audit_logs VALUES (audit_row.*);
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to questions table
CREATE TRIGGER audit_questions
  AFTER INSERT OR UPDATE OR DELETE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Apply trigger to wiki_articles table
CREATE TRIGGER audit_wiki_articles
  AFTER INSERT OR UPDATE OR DELETE ON public.wiki_articles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
```

### Pattern 5: SME Review State Machine

**What:** TypeScript state machine for content workflow with defined transitions.

**When to use:** Managing content review lifecycle from draft to published.

**Example:**
```typescript
// src/lib/workflow/content-workflow.ts
export type ContentStatus = 
  | 'draft' 
  | 'pending_review' 
  | 'changes_requested' 
  | 'approved' 
  | 'published';

export interface WorkflowTransition {
  from: ContentStatus;
  to: ContentStatus;
  allowedRoles: ('content_admin' | 'sme_reviewer')[];
  requiresComment?: boolean;
}

export const WORKFLOW_TRANSITIONS: WorkflowTransition[] = [
  { from: 'draft', to: 'pending_review', allowedRoles: ['content_admin'] },
  { from: 'pending_review', to: 'approved', allowedRoles: ['sme_reviewer'] },
  { from: 'pending_review', to: 'changes_requested', allowedRoles: ['sme_reviewer'], requiresComment: true },
  { from: 'changes_requested', to: 'pending_review', allowedRoles: ['content_admin'] },
  { from: 'changes_requested', to: 'draft', allowedRoles: ['content_admin'] },
  { from: 'approved', to: 'published', allowedRoles: ['content_admin'] },
  { from: 'published', to: 'draft', allowedRoles: ['content_admin'] },
];

export interface WorkflowState {
  currentStatus: ContentStatus;
  reviewerComments?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export function canTransition(
  from: ContentStatus,
  to: ContentStatus,
  userRole: string
): boolean {
  const transition = WORKFLOW_TRANSITIONS.find(
    t => t.from === from && t.to === to
  );
  
  if (!transition) return false;
  return transition.allowedRoles.includes(userRole as 'content_admin' | 'sme_reviewer');
}

export function getAvailableTransitions(
  currentStatus: ContentStatus,
  userRole: string
): ContentStatus[] {
  return WORKFLOW_TRANSITIONS
    .filter(t => t.from === currentStatus && t.allowedRoles.includes(userRole as any))
    .map(t => t.to);
}
```

### Pattern 6: In-App Notification Bell

**What:** Simple bell icon with badge count and dropdown for pending reviews.

**When to use:** SME review queue notifications.

**Example:**
```typescript
// src/components/shared/NotificationBell.tsx
'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'review_request' | 'changes_requested' | 'approved';
  content_title: string;
  content_id: string;
  created_at: string;
  read: boolean;
}

export function NotificationBell({ userRole }: { userRole: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Fetch notifications for SME reviewers
    if (userRole === 'sme_reviewer') {
      fetchNotifications();
      
      // Subscribe to new notifications
      const channel = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${supabase.auth.getUser()}`,
        }, (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userRole, supabase]);

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 hover:bg-muted"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-background shadow-lg">
            <div className="border-b px-4 py-3">
              <h3 className="font-semibold">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={cn(
                      "border-b px-4 py-3 hover:bg-muted",
                      !notification.read && "bg-blue-50 dark:bg-blue-950"
                    )}
                  >
                    <p className="text-sm">
                      <span className="font-medium">{notification.type}:</span>{' '}
                      {notification.content_title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

### Pattern 7: Admin Route Middleware

**What:** Next.js middleware to protect admin routes based on role.

**Example:**
```typescript
// src/lib/supabase/admin-middleware.ts
import { createMiddlewareClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_ROUTES = ['/admin', '/admin/*'];

export async function adminMiddleware(
  request: NextRequest,
  next: (request: NextRequest) => Promise<NextResponse>
) {
  const supabase = createMiddlewareClient({ req: request, res: {} });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check user role
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .in('role', ['super_admin', 'content_admin', 'sme_reviewer'])
    .single();

  if (!userRole) {
    // Not an admin - redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return next(request);
}
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSV parsing | Custom regex parser | papaparse | Handles edge cases (quotes, commas in values, encoding) |
| Audit logging | Application-level logging | PostgreSQL triggers | Triggers fire regardless of entry point (API, console, bug) |
| State transitions | if/else chains | Explicit state machine | Prevents invalid transitions, easier to test |
| Role checking | Auth metadata | Database + RLS | RLS enforces at DB level, not just app level |

**Key insight:** Database triggers are essential for audit logging because they capture ALL changes - direct SQL, API bugs, or application code. Application-level logging misses direct database modifications.

---

## Common Pitfalls

### Pitfall 1: Missing RLS on user_roles Table
**What goes wrong:** Role table has no RLS, allowing anyone to read/write roles.
**Why it happens:** Developers enable RLS on content tables but forget admin tables.
**How to avoid:** Always enable RLS and add at least one SELECT policy.
**Warning signs:** `relation "user_roles" is not accessible` error.

### Pitfall 2: CSV Encoding Issues
**What goes wrong:** Special characters (é, 中文) render incorrectly.
**Why it happens:** Not specifying encoding in Papa.parse.
**How to avoid:** Let Papa detect encoding automatically or specify UTF-8.
**Warning signs:** Garbled characters in imported questions.

### Pitfall 3: Large Audit Tables Without Partitioning
**What goes wrong:** Query performance degrades as audit_logs grows.
**Why it happens:** Single table with millions of rows.
**How to avoid:** Consider table partitioning by date or use archival strategy.
**Warning signs:** Slow audit log queries.

### Pitfall 4: State Machine Missing Edge Cases
**What goes wrong:** Invalid transitions allowed (e.g., draft → published directly).
**Why it happens:** Not exhaustively defining all valid transitions.
**How to avoid:** Define transitions explicitly, validate in database trigger or application code.
**Warning signs:** Content in impossible states.

### Pitfall 5: Auto-save Without Debouncing
**What goes wrong:** Excessive database writes on every keystroke.
**Why it happens:** Saving on every `onChange` event.
**How to avoid:** Use debounce (30 seconds as per CONTEXT.md).
**Warning signs:** High database load, slow saves.

---

## Code Examples

### Extended is-admin.ts Function

```typescript
// src/lib/admin/is-admin.ts
import { createClient } from "@/lib/supabase/server";

export type UserRole = 'super_admin' | 'content_admin' | 'sme_reviewer';

export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Check database roles first (takes precedence)
  const { data: dbRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (dbRole) return dbRole.role as UserRole;

  // Fallback to legacy email-based admin
  const adminEmails = ['philipjonlewis@gmail.com'];
  if (user.email && adminEmails.includes(user.email)) {
    return 'super_admin';
  }

  return null;
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'super_admin' || role === 'content_admin';
}

export async function isSuperAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'super_admin';
}

export async function canManageContent(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'super_admin' || role === 'content_admin';
}

export async function canReviewContent(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'super_admin' || role === 'content_admin' || role === 'sme_reviewer';
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Email-based admin check | Database user_roles table | Phase 4 | Enables UI role management |
| No audit logging | Trigger-based JSONB audit | Phase 4 | Compliance, debugging |
| No workflow states | Explicit state machine | Phase 4 | Prevents invalid states |
| Manual content management | Admin dashboard | Phase 4 | No code changes needed |

**Deprecated/outdated:**
- Hardcoded admin emails - replaced by database roles
- Application-level audit logging - replaced by triggers

---

## Open Questions

1. **Notification persistence**
   - What we know: In-app only per CONTEXT.md
   - What's unclear: How long to keep notifications, if any cleanup needed
   - Recommendation: Add `read_at` timestamp, auto-archive after 30 days

2. **Large file imports**
   - What we know: Strict validation all-or-nothing
   - What's unclear: How to handle files > 10MB
   - Recommendation: Add client-side file size validation, server-side chunked processing for large imports

3. **Concurrent editing**
   - What we know: Auto-save every 30 seconds
   - What's unclear: Conflict resolution if multiple admins edit same article
   - Recommendation: Add `updated_at` check, warn user if content changed since load

---

## Sources

### Primary (HIGH confidence)
- Supabase Docs - Custom Claims & RBAC: https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac
- Supabase Docs - Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Papa Parse Documentation: https://www.papaparse.com/docs
- TipTap Documentation: https://tiptap.dev/docs

### Secondary (MEDIUM confidence)
- PostgreSQL Triggers for Audit - OneUptime: https://oneuptime.com/blog/post/2026-01-30-postgresql-triggers-audit/view
- Supabase Middleware Patterns - Makerkit: https://makerkit.dev/blog/tutorials/supabase-rls-best-practices

### Tertiary (LOW confidence)
- XState for Workflows: https://github.com/cevheri/react-workflow-template

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (existing in project via vitest.config patterns) |
| Config file | `vitest.config.ts` if exists, else default |
| Quick run command | `npm run test` or `bun test` |
| Full suite command | `npm run test -- --run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| REQ-4.1 | Admin role check | unit | `bun test src/lib/admin/*.test.ts` | ✅ Wave 0 |
| REQ-4.2 | CSV parsing validation | unit | `bun test src/lib/import/*.test.ts` | ❌ New |
| REQ-4.3 | Editor auto-save | integration | `bun test src/components/admin/*.test.tsx` | ❌ New |
| REQ-4.4 | Audit trigger fires | integration | `bun test src/lib/audit/*.test.ts` | ❌ New |
| REQ-4.5 | State transitions | unit | `bun test src/lib/workflow/*.test.ts` | ❌ New |

### Sampling Rate
- **Per task commit:** `bun test --run` (all tests)
- **Per wave merge:** Full suite via CI
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/lib/admin/is-admin.test.ts` — extends REQ-4.1, tests role checking
- [ ] `src/lib/import/question-importer.test.ts` — tests CSV/JSON parsing
- [ ] `src/lib/workflow/content-workflow.test.ts` — tests state machine transitions
- [ ] `src/lib/audit/audit-log.test.ts` — tests audit query helpers

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - papaparse and TipTap are industry standards, already in project
- Architecture: HIGH - RLS, triggers, state machines are well-documented patterns
- Pitfalls: HIGH - common issues with documented solutions

**Research date:** March 15, 2026
**Valid until:** 90 days (patterns are stable)
