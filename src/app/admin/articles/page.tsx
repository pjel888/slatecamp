import type { Metadata } from 'next'
import { getAdminTaxonomyTree } from '@/lib/actions/admin/wiki-queries'
import { ArticlesClient } from './_components/ArticlesClient'

export const metadata: Metadata = { title: 'Articles — SlateCamp Admin' }

const AdminArticlesPage = async () => {
  const { disciplines, treeByDiscipline, unmappedArticles } = await getAdminTaxonomyTree()

  return (
    <ArticlesClient
      disciplines={disciplines}
      treeByDiscipline={treeByDiscipline}
      unmappedArticles={unmappedArticles}
    />
  )
}

export default AdminArticlesPage
