import { getStudioModeData } from '@/lib/actions/studio-mode'
import { StudioHub } from './_components/StudioHub'
import { ExploreLayout } from '@/components/layouts/category/ExploreLayout'

export const metadata = {
  title: 'Studio Mode',
}

export default async function StudioPage() {
  const { userName } = await getStudioModeData()

  return (
    <ExploreLayout
      hero={{
        subtitle: 'Studio Mode',
        description: 'Your creative workspace for architectural design exploration.',
      }}
    >
      <StudioHub userName={userName} />
    </ExploreLayout>
  )
}
