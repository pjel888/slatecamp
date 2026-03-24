import type { Metadata } from 'next'
import { getArticles } from '@/lib/actions/admin/wiki-queries'

export const metadata: Metadata = { title: 'Articles — SlateCamp Admin' }
import { ArticlesClient } from './_components/ArticlesClient'

const AdminArticlesPage = async () => {
  const articles = await getArticles()

  return <ArticlesClient articles={articles} />
}

export default AdminArticlesPage
