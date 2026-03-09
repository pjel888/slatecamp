'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('notes')
    .select('id, title, content, updated_at, is_pinned')
    .eq('user_id', user.id)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  if (error) return []
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    updated_at: row.updated_at,
    is_pinned: row.is_pinned,
    snippet: snippetFromContent((row.content ?? {}) as Record<string, unknown>),
  })) as NoteStub[]
}

export async function getNote(id: string): Promise<Note | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return null
  return data as Note
}

/** Create a new note and return its id. Caller should redirect to /dashboard/notes/[id]. */
export async function createNote(): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      title: 'Untitled Note',
      content: {},
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (updates.title !== undefined) payload.title = updates.title
  if (updates.content !== undefined) payload.content = updates.content
  if (updates.is_pinned !== undefined) payload.is_pinned = updates.is_pinned

  const { error } = await supabase
    .from('notes')
    .update(payload)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/notes')
  return {}
}

export async function deleteNote(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/notes')
  return {}
}
