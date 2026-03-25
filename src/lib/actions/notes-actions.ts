'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getUser } from '@/lib/supabase/server'
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

/** List all notes for the current user. */
export async function getNotesList(folderId?: string): Promise<NoteStub[]> {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  let query = supabase
    .from('notes')
    .select('note_id, title, content, updated_at, is_pinned')
    .eq('user_id', user.id)

  if (folderId) {
    query = query.eq('folder_id', folderId)
  }

  const { data, error } = await query
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  if (error) return []
  return (data ?? []).map((row: any) => ({
    id: row.note_id,
    title: row.title,
    updated_at: row.updated_at,
    is_pinned: row.is_pinned,
    snippet: snippetFromContent((row.content ?? {}) as Record<string, unknown>),
  })) as NoteStub[]
}

/** List all folders for the current user. */
export async function getNoteFolders() {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('note_folders')
    .select('folder_id, user_id, name, created_at, updated_at')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (error) return []
  return data
}

export async function getNote(id: string): Promise<Note | null> {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('notes')
    .select('note_id, user_id, title, content, folder_id, topic_id, question_id, article_id, session_id, source_url, note_type, tags, color, is_pinned, created_at, updated_at')
    .eq('note_id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return null

  // Map note_id to id for UI compatibility
  const { note_id, ...rest } = data
  return { id: note_id, ...rest } as unknown as Note
}

export async function createNote(
  input?: {
    title?: string
    content?: Record<string, unknown>
    folder_id?: string
    topic_id?: string
    question_id?: string
    article_id?: string
    session_id?: string
    source_url?: string
    note_type?: string
    tags?: string[]
    color?: string
  }
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      title: input?.title ?? 'Untitled Note',
      content: input?.content || { type: 'doc', content: [] },
      folder_id: input?.folder_id ?? null,
      topic_id: input?.topic_id ?? null,
      question_id: input?.question_id ?? null,
      article_id: input?.article_id ?? null,
      session_id: input?.session_id ?? null,
      source_url: input?.source_url ?? null,
      note_type: input?.note_type ?? 'standard',
      tags: input?.tags ?? [],
      color: input?.color ?? null,
    })
    .select('note_id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/notes')
  return { id: data.note_id }
}

export async function createNoteFolder(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('note_folders')
    .insert({ user_id: user.id, name })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/notes')
  return data
}

export async function updateNote(
  id: string,
  updates: {
    title?: string
    content?: Record<string, unknown>
    is_pinned?: boolean
    folder_id?: string | null
    topic_id?: string | null
    tags?: string[]
    color?: string | null
    note_type?: string
  }
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('notes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('note_id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/notes')
  return {}
}

export async function deleteNote(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('note_id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/notes')
  return {}
}
