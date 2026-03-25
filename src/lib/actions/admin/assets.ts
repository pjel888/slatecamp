'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { canManageContent } from '@/lib/admin/roles'
import { z } from 'zod'

export const getAssets = async () => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('models_3d')
    .select('id:model_id, name, slug, url, thumbnail, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching assets:', error)
    return []
  }

  return data || []
}

export const getAsset = async (id: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('models_3d')
    .select('id:model_id, name, slug, url, thumbnail, status, metadata, created_at')
    .eq('model_id', id)
    .single()

  if (error) {
    console.error('Error fetching asset:', error)
    return null
  }

  return data
}

const createAssetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255),
  url: z.string().url('Invalid URL'),
  thumbnail: z.string().url('Invalid thumbnail URL').optional(),
  metadata: z.record(z.string(), z.unknown()),
})

export const createAsset = async (data: {
  name: string
  slug: string
  url: string
  thumbnail?: string
  metadata: object
}) => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const parsed = createAssetSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  const supabase = createAdminClient()

  const { data: newAsset, error } = await supabase
    .from('models_3d')
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      url: parsed.data.url,
      thumbnail: parsed.data.thumbnail ?? null,
      metadata: parsed.data.metadata,
      status: 'draft',
      created_by: user?.id ?? null,
    })
    .select('id:model_id, name, slug, url, thumbnail, created_at')
    .single()

  if (!error) {
    revalidatePath('/admin/assets')
  }

  return { data: newAsset, error }
}

export const uploadAssetFile = async (formData: FormData): Promise<{ url: string | null; error: string | null }> => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const file = formData.get('file') as File | null
  if (!file) return { url: null, error: 'No file provided' }

  const fileExt = file.name.split('.').pop()
  const baseName = file.name.replace(/\.(glb|gltf)$/i, '')
  const filePath = `assets/${Date.now()}-${baseName}.${fileExt}`

  const supabase = createAdminClient()

  const { error: uploadError } = await supabase.storage
    .from('3d-models')
    .upload(filePath, file)

  if (uploadError) return { url: null, error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage
    .from('3d-models')
    .getPublicUrl(filePath)

  return { url: publicUrl, error: null }
}
