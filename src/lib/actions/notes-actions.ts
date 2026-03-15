'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Note = {
  note_id: string
  user_id: string
  title: string
  content: any
  updated_at: string
  created_at: string
}

export async function getNotes() {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching notes:', error)
    return []
  }

  return data as Note[]
}

export async function getNote(noteId: string): Promise<Note | null> {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('note_id', noteId)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return null
  return data as Note
}

export async function createNote() {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const newNote = {
    user_id: user.id,
    title: '', // Empty title to start
    content: { type: 'doc', content: [] }, // Empty TipTap doc
  }

  const { data, error } = await supabase
    .from('notes')
    .insert(newNote)
    .select()
    .single()

  if (error) {
    console.error('Error creating note:', error)
    throw new Error('Failed to create note')
  }

  revalidatePath('/dashboard/notes')
  return data as Note
}

export async function updateNote(noteId: string, updates: Partial<Note>) {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('notes')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('note_id', noteId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating note:', error)
    throw new Error('Failed to update note')
  }

  revalidatePath('/dashboard/notes')
}

export async function deleteNote(noteId: string) {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('note_id', noteId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting note:', error)
    throw new Error('Failed to delete note')
  }

  revalidatePath('/dashboard/notes')
}
