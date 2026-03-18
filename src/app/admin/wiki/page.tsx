import { getArticles } from '@/lib/actions/admin/wiki-queries'
import { WikiArticleList } from '@/components/admin/WikiArticleList'

export default async function AdminWikiPage() {
  const articles = await getArticles()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Wiki Content Manager</h1>
        <p className="text-muted-foreground">Manage knowledge base articles</p>
      </div>

      <WikiArticleList initialArticles={articles} />
    </div>
  )
}
