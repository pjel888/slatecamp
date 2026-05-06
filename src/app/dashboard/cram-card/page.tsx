import { PracticeLayout } from '@/components/layouts/category/PracticeLayout'
import { getCramCardData } from '@/lib/actions/cram-card'
import { CramCardPage } from './_components/CramCardPage'

export const metadata = {
  title: 'Cram Card',
}

const CramCardServerPage = async () => {
  const data = await getCramCardData()

  return (
    <PracticeLayout
      hero={{
        subtitle: 'Cram Card',
        description: 'Quick-reference flash cards for last-minute exam review.',
      }}
    >
      <CramCardPage data={data} />
    </PracticeLayout>
  )
}

export default CramCardServerPage
