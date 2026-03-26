import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { getCramCardData } from '@/lib/actions/cram-card'
import { CramCardPage } from './_components/CramCardPage'

export const metadata = {
  title: 'Cram Card',
}

const CramCardServerPage = async () => {
  const data = await getCramCardData()

  return (
    <SharedPageLayout>
      <CramCardPage data={data} />
    </SharedPageLayout>
  )
}

export default CramCardServerPage
