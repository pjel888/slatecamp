'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { DeleteArticleModal } from '@/components/admin/DeleteArticleModal'
import { ArticleQuestionImporter } from '@/components/admin/ArticleQuestionImporter'
import { UnifiedContentEditor } from '@/components/admin/unified-editor'
import type {
  ArticleData,
  QuestionData,
  EIPromptData,
  TaxonomyNodeInfo,
  TaxonomyLink,
} from '@/components/admin/unified-editor/types'

interface ArticleDetailClientProps {
  article: ArticleData
  questions: QuestionData[]
  articleQuestions?: QuestionData[]
  eiPrompts: EIPromptData[]
  taxonomyNodes: TaxonomyNodeInfo[]
  taxonomyLinks: TaxonomyLink[]
}

export const ArticleDetailClient = ({
  article,
  questions,
  articleQuestions = [],
  eiPrompts,
  taxonomyNodes,
  taxonomyLinks,
}: ArticleDetailClientProps) => {
  const router = useRouter()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const primaryLink = taxonomyLinks.find((l) => l.is_primary)
  const primaryNodeId = primaryLink?.node_id || taxonomyLinks[0]?.node_id

  const handleImportComplete = () => {
    router.refresh()
  }

  return (
    <>
      <div className="relative">
        <UnifiedContentEditor
          article={article}
          questions={questions}
          articleQuestions={articleQuestions}
          eiPrompts={eiPrompts}
          taxonomyNodes={taxonomyNodes}
          taxonomyLinks={taxonomyLinks}
        />
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {primaryNodeId && (
            <ArticleQuestionImporter
              articleId={article.article_id}
              topicId={primaryNodeId}
              onImportComplete={handleImportComplete}
            />
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash className="w-4 h-4 mr-1.5" />
            Archive Article
          </Button>
        </div>
      </div>

      <DeleteArticleModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        articleId={article.article_id}
        articleTitle={article.title}
        redirectTo="/admin/knowledge"
      />
    </>
  )
}
