'use client'

import { createClient } from '@/lib/supabase/client'

const BUCKET = 'note-images'

/**
 * Uploads a File to the note-images Storage bucket under the user's folder.
 * Returns a 1-year signed URL suitable for embedding in TipTap JSON content.
 */
export async function uploadNoteImage(file: File, userId: string): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop() ?? 'png'
  const path = `${userId}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '31536000', upsert: false })

  if (uploadError) throw new Error(uploadError.message)

  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365)

  if (!data?.signedUrl) throw new Error('Failed to generate signed URL for uploaded image')
  return data.signedUrl
}
