export interface TopicArticleMappingInput {
  node_id: string
  article_id: string
}

export interface TopicArticleRecordInput {
  article_id: string
  title: string | null
  status: string | null
  updated_at: string
}

export interface TopicArticleResolution {
  topicArticles: Array<{
    topicId: string
    articleId: string
    articleTitle: string | null
    articleStatus: string | null
  }>
  selectedTopicArticle: {
    topicId: string
    articleId: string
    articleTitle: string | null
    articleStatus: string | null
  } | null
  hasAmbiguousPrimaryMappings: boolean
}

export const resolveTopicArticleContext = ({
  topicId,
  primaryMappings,
  articles,
}: {
  topicId?: string
  primaryMappings: TopicArticleMappingInput[]
  articles: TopicArticleRecordInput[]
}): TopicArticleResolution => {
  const articleLookup = new Map(articles.map((article) => [article.article_id, article]))
  const groupedMappings = new Map<string, TopicArticleMappingInput[]>()

  for (const mapping of primaryMappings) {
    if (!groupedMappings.has(mapping.node_id)) {
      groupedMappings.set(mapping.node_id, [])
    }
    groupedMappings.get(mapping.node_id)?.push(mapping)
  }

  const topicArticles = [...groupedMappings.entries()]
    .map(([mappedTopicId, mappings]) => {
      const candidates = mappings
        .map((mapping) => articleLookup.get(mapping.article_id))
        .filter((article): article is TopicArticleRecordInput => Boolean(article))
        .sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime())

      const selected = candidates[0]
      if (!selected) return null

      return {
        topicId: mappedTopicId,
        articleId: selected.article_id,
        articleTitle: selected.title ?? null,
        articleStatus: selected.status ?? null,
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))

  const topicLookup = new Map(topicArticles.map((entry) => [entry.topicId, entry]))
  const selectedTopicMappings = topicId ? groupedMappings.get(topicId) ?? [] : []

  return {
    topicArticles,
    selectedTopicArticle: topicId ? topicLookup.get(topicId) ?? null : null,
    hasAmbiguousPrimaryMappings: selectedTopicMappings.length > 1,
  }
}
