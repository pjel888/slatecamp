import type { Metadata } from 'next'
import { PracticeLayout } from '@/components/layouts/category/PracticeLayout'
import { FlashHub } from './_components/FlashHub'
import { getFlashCategories } from '@/lib/actions/flash-cards'

export const metadata: Metadata = { title: 'LEA Numbers Flash' }

const FlashPage = async () => {
  const categories = await getFlashCategories()
  return (
    <PracticeLayout
      hero={{
        subtitle: 'LEA Numbers Flash',
        description:
          'Critical code numbers for the Licensure Examination for Architects (LEA). Tap a category to start.',
      }}
    >
      <FlashHub categories={categories} />
    </PracticeLayout>
  )
}

export default FlashPage
