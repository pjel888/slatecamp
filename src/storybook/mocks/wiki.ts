import {
  wikiReferenceArticleFixture,
  wikiSearchResultsFixture,
  wikiSidebarNodesFixture,
} from '@/storybook/fixtures/wiki'

const filterResults = (query: string) => {
  const normalized = query.trim().toLowerCase()

  return wikiSearchResultsFixture.filter(
    (result) =>
      result.title.toLowerCase().includes(normalized) ||
      result.content_snippet.toLowerCase().includes(normalized),
  )
}

export const getWikiTaxonomyTree = async (_disciplineId: string) =>
  wikiSidebarNodesFixture

export const getWikiArticlesByNode = async (_nodeId: string) => [
  wikiReferenceArticleFixture,
]

export const getWikiArticleBySlug = async (slug: string) => {
  if (slug === wikiReferenceArticleFixture.slug) {
    return wikiReferenceArticleFixture
  }

  return null
}

export const searchWiki = async (searchTerm: string, limit = 20) =>
  filterResults(searchTerm).slice(0, limit)

export const searchWikiPaginated = async (
  searchTerm: string,
  page = 1,
  perPage = 10,
) => {
  const results = filterResults(searchTerm)
  const start = (page - 1) * perPage

  return {
    results: results.slice(start, start + perPage),
    totalCount: results.length,
  }
}
