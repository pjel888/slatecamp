import dynamic from 'next/dynamic'
import { getArticle } from '@/lib/actions/admin/wiki-queries'
import { notFound } from 'next/navigation'

const WikiEditor = dynamic(
  () => import('@/components/admin/WikiEditor').then(m => m.WikiEditor),
)

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditWikiPage({ params }: PageProps) {
  const { id } = await params
  const article = await getArticle(id)

  if (!article) notFound()

  return <WikiEditor article={article} />
}
