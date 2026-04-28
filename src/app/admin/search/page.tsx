import { assertPermission } from '@/lib/admin/roles'
import { ContentSearchClient } from './_components/ContentSearchClient'

export default async function ContentSearchPage() {
  await assertPermission('admin.search.use')
  return <ContentSearchClient />
}
