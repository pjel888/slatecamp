'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { assertPermission } from '@/lib/admin/roles'
import { z } from 'zod'
import { logServerError } from '@/lib/logging/server'
import { ROUTES } from '@/lib/routes'

const ASSET_BUCKET = '3d-models'

export const getAssets = async () => {
  await assertPermission('admin.assets.manage')

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('models_3d')
    .select('id:model_id, name, slug, url, thumbnail, status, metadata, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching assets:', error)
    return []
  }

  return data || []
}

export const getAsset = async (id: string) => {
  await assertPermission('admin.assets.manage')

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('models_3d')
    .select('id:model_id, name, slug, url, thumbnail, status, metadata, created_at, updated_at')
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
  await assertPermission('admin.assets.manage')

  const parsed = createAssetSchema.safeParse(data)
  if (!parsed.success) {
    await logServerError({
      family: 'admin',
      eventName: 'assets_create_validation_failed',
      message: 'Asset creation validation failed.',
      context: {
        routeOrAction: 'admin:assets.create',
      },
      error: new Error(parsed.error.issues[0].message),
      persist: false,
    })
    throw new Error(parsed.error.issues[0].message)
  }

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
    })
    .select('id:model_id, name, slug, url, thumbnail, created_at')
    .single()

  if (!error) {
    revalidatePath('/admin/assets')
  }

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'assets_create_failed',
      message: 'Failed to create a 3D asset.',
      context: {
        routeOrAction: 'admin:assets.create',
        metadata: {
          slug: parsed.data.slug,
        },
      },
      error,
    })
  }

  return { data: newAsset, error }
}

export const uploadAssetFile = async (formData: FormData): Promise<{ url: string | null; error: string | null }> => {
  await assertPermission('admin.assets.manage')

  const file = formData.get('file') as File | null
  if (!file) return { url: null, error: 'No file provided' }

  const fileExt = file.name.split('.').pop()
  const baseName = file.name.replace(/\.(glb|gltf)$/i, '')
  const filePath = `assets/${Date.now()}-${baseName}.${fileExt}`

  const supabase = createAdminClient()

  let { error: uploadError } = await supabase.storage
    .from(ASSET_BUCKET)
    .upload(filePath, file)

  const shouldCreateBucket =
    uploadError && /bucket not found/i.test(uploadError.message)

  if (shouldCreateBucket) {
    const { error: createBucketError } = await supabase.storage.createBucket(ASSET_BUCKET, {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024,
      allowedMimeTypes: [
        'model/gltf-binary',
        'model/gltf+json',
        'application/octet-stream',
        'image/png',
        'image/jpeg',
        'image/webp',
      ],
    })

    if (!createBucketError || /already exists/i.test(createBucketError.message)) {
      const retryResult = await supabase.storage
        .from(ASSET_BUCKET)
        .upload(filePath, file)

      uploadError = retryResult.error
    }
  }

  if (uploadError) {
    await logServerError({
      family: 'admin',
      eventName: 'assets_upload_failed',
      message: 'Failed to upload a 3D asset file.',
      context: {
        routeOrAction: 'admin:assets.uploadFile',
        metadata: {
          filePath,
          fileName: file.name,
        },
      },
      error: uploadError,
    })
    return { url: null, error: uploadError.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from(ASSET_BUCKET)
    .getPublicUrl(filePath)

  return { url: publicUrl, error: null }
}

export const archiveAsset = async (id: string) => {
  await assertPermission('admin.assets.manage')

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('models_3d')
    .update({
      status: 'archived',
      updated_at: new Date().toISOString(),
    })
    .eq('model_id', id)

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'assets_archive_failed',
      message: 'Failed to archive a 3D asset.',
      context: {
        routeOrAction: 'admin:assets.archive',
        metadata: {
          assetId: id,
        },
      },
      error,
    })
    throw new Error(`Failed to archive asset: ${error.message}`)
  }

  revalidatePath(ROUTES.admin.assets)
  revalidatePath(`${ROUTES.admin.assets}/${id}`)

  return { error: null }
}
