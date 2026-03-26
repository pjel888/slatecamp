import { getStudioModeData } from '@/lib/actions/studio-mode'
import { StudioHub } from './_components/StudioHub'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'

export const metadata = {
  title: 'Studio Mode',
}

export default async function StudioPage() {
  const { userName } = await getStudioModeData()

  return (
    <SharedPageLayout>
      <StudioHub userName={userName} />
    </SharedPageLayout>
  )
}
