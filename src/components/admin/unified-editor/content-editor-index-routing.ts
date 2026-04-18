import { ROUTES } from '@/lib/routes'

export const buildContentEditorIndexHref = ({
  basePath = ROUTES.admin.knowledge,
  currentSearch,
  mode,
  topic,
}: {
  basePath?: string
  currentSearch: string
  mode: 'articles' | 'questions'
  topic: string | null
}) => {
  const params = new URLSearchParams(currentSearch)
  params.set('view', mode)

  if (topic) {
    params.set('topic', topic)
  } else {
    params.delete('topic')
  }

  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}
