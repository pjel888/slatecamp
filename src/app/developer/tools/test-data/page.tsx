import { assertDeveloperAccess } from '@/lib/developer/access'
import { TestDataClient } from './test-data-client'

export default async function TestDataPage() {
  await assertDeveloperAccess()

  return <TestDataClient />
}
