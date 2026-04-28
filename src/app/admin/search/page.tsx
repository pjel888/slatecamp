import { requirePermissionOrRedirect } from '@/lib/admin/roles'
import { ContentSearchClient } from './_components/ContentSearchClient'

export default async function ContentSearchPage() {
  await requirePermissionOrRedirect('admin.search.use')
  return <ContentSearchClient />
}
