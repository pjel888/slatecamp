import type { Metadata } from 'next'
import { getAssets } from '@/lib/actions/admin/assets'

export const metadata: Metadata = { title: '3D Assets — SlateCamp Admin' }
import { AssetList } from '@/components/admin/AssetList'
import { AssetUploader } from '@/components/admin/AssetUploader'

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
          <div id="asset-uploader" className="rounded-md border p-6">
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
