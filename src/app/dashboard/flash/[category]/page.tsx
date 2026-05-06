import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PracticeLayout } from '@/components/layouts/category/PracticeLayout'
import { FlashSession } from '../_components/FlashSession'
import { getFlashCardsForCategory } from '@/lib/actions/flash-cards'
import { getCategoryLabel } from '@/lib/flash-cards'

interface Props { params: Promise<{ category: string }> }

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { category: categoryId } = await params
  return { title: `${getCategoryLabel(categoryId)} — Flash` }
}

const FlashCategoryPage = async ({ params }: Props) => {
  const { category: categoryId } = await params
  const { cards, label } = await getFlashCardsForCategory(categoryId)
  if (cards.length === 0) notFound()
  return (
    <PracticeLayout
      hero={{ subtitle: label, description: `${cards.length} flash cards. Memorize key LEA code numbers.` }}
    >
      <FlashSession category={{ id: categoryId, label, description: '', cardCount: cards.length }} cards={cards} />
    </PracticeLayout>
  )
}

export default FlashCategoryPage
