import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { canManageContent } from '@/lib/admin/roles'
import { getAsset } from '@/lib/actions/admin/assets'
import { AssetDetailView } from '@/components/admin/AssetDetailView'
import { Breadcrumb } from '@/components/ui/breadcrumb'

export const metadata: Metadata = { title: 'Asset Detail | SlateCamp Admin' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AssetDetailPage({ params }: PageProps) {
  const authorized = await canManageContent()
  if (!authorized) redirect(ROUTES.admin.root)

  const { id } = await params
  const asset = await getAsset(id)
  if (!asset) notFound()

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Structure', href: ROUTES.admin.assets },
          { label: 'Asset Detail' },
        ]}
      />
      <AssetDetailView asset={asset} />
    </div>
  )
}
