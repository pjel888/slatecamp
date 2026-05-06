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
          'Critical LEA numbers. Tap a category to begin.',
      }}
    >
      <FlashHub categories={categories} />
    </PracticeLayout>
  )
}

export default FlashPage
