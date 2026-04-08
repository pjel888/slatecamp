import type { Metadata } from 'next'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { FlashHub } from './_components/FlashHub'
import { getFlashCategories } from '@/lib/actions/flash-cards'

export const metadata: Metadata = {
  title: 'LEA Numbers Flash',
}

const FlashPage = async () => {
  const categories = await getFlashCategories()

  return (
    <SharedPageLayout>
      <div className='p-2 xl:p-3'>
        <FlashHub categories={categories} />
      </div>
    </SharedPageLayout>
  )
}

export default FlashPage
