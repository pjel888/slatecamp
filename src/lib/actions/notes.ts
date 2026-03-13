'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getUser } from '@/lib/supabase/server'
import { createNoteSchema, updateNoteSchema, deleteNoteSchema } from '@/lib/validations'
import type { Note, NoteStub } from '@/types/app'

function snippetFromContent(content: Record<string, unknown>, maxLen = 80): string {
  try {
    const doc = content as { content?: Array<{ content?: Array<{ text?: string }> }> }
    if (!doc.content) return ''
    let text = ''
    function walk(n: { content?: Array<{ text?: string }> }): void {
      if (n.content) n.content.forEach((c) => ('text' in c && c.text ? (text += c.text) : walk(c as never)))
    }
    doc.content.forEach(walk)
    return text.replace(/\s+/g, ' ').trim().slice(0, maxLen) || ''
  } catch {
    return ''
  }
}

/** List all notes for the current user, ordered by updated_at (pinned first). */
export async function getNotesList(): Promise<NoteStub[]> {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('notes')
    .select('id, title, content, updated_at, is_pinned')
    .eq('user_id', user.id)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  if (error) return []
  return (data ?? []).map((row: { id: string; title: string; updated_at: string; is_pinned: boolean; content?: unknown }) => ({
    id: row.id,
    title: row.title,
    updated_at: row.updated_at,
    is_pinned: row.is_pinned,
    snippet: snippetFromContent((row.content ?? {}) as Record<string, unknown>),
  })) as NoteStub[]
}

export async function getNote(id: string): Promise<Note | null> {
  // Validate UUID format
  const parseResult = deleteNoteSchema.safeParse({ id })
  if (!parseResult.success) {
    return null
  }

  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', parseResult.data.id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return null
  return data as Note
}

/** Create a new note and return its id. Caller should redirect to /dashboard/notes/[id]. */
export async function createNote(
  input?: { title?: string; content?: Record<string, unknown>; subject_id?: string }
): Promise<{ id: string } | { error: string }> {
  // Validate input if provided
  if (input) {
    const parseResult = createNoteSchema.safeParse(input)
    if (!parseResult.success) {
      return { error: parseResult.error.issues[0]?.message || 'Invalid input' }
    }
  }

  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      title: input?.title ?? 'Untitled Note',
      content: input?.content ?? {},
      subject_id: input?.subject_id,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/notes')
  return { id: data.id }
}

export async function updateNote(
  id: string,
  updates: {
    title?: string
    content?: Record<string, unknown>
    is_pinned?: boolean
  }
): Promise<{ error?: string }> {
  // Validate input
  const parseResult = updateNoteSchema.safeParse({ id, ...updates })
  if (!parseResult.success) {
    return { error: parseResult.error.issues[0]?.message || 'Invalid input' }
  }

  const { id: validId, title, content, is_pinned } = parseResult.data

  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { error: 'Unauthorized' }

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (title !== undefined) payload.title = title
  if (content !== undefined) payload.content = content
  if (is_pinned !== undefined) payload.is_pinned = is_pinned

  const { error } = await supabase
    .from('notes')
    .update(payload)
    .eq('id', validId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/notes')
  return {}
}

export async function deleteNote(id: string): Promise<{ error?: string }> {
  // Validate input
  const parseResult = deleteNoteSchema.safeParse({ id })
  if (!parseResult.success) {
    return { error: 'Invalid note ID format' }
  }

  const { id: validId } = parseResult.data

  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', validId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/notes')
  return {}
}
