import { createClient } from '@/lib/supabase/server'
import { AssetList } from '@/components/admin/AssetList'
import { AssetUploader } from '@/components/admin/AssetUploader'

async function getAssets() {
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

export default async function AdminAssetsPage() {
  const assets = await getAssets()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">3D Asset Manager</h1>
        <p className="text-muted-foreground">Upload and manage 3D model files</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-md border p-6">
            <h2 className="text-lg font-semibold mb-4">Upload New Asset</h2>
            <AssetUploader />
          </div>
        </div>
        <div className="lg:col-span-2">
          <AssetList initialAssets={assets} />
        </div>
      </div>
    </div>
  )
}
