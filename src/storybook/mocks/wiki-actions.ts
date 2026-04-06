import type { TaxonomyNode } from '@/lib/actions/taxonomy'
import {
  wikiArticleHeroFixture,
  wikiBreadcrumbsFixture,
  wikiReferenceArticleFixture,
  wikiSearchResultsFixture,
  wikiSidebarNodesFixture,
  wikiSourcesFixture,
} from '@/storybook/fixtures/wiki'

export interface WikiArticleSource {
  source_id: string
  label: string
  description: string | null
  url: string | null
  source_type: string
  sort_order: number
}

export interface BreadcrumbItem {
  name: string
  slug: string | null
  node_id: string
  level: number
}

const matchesQuery = (text: string, query: string) =>
  text.toLowerCase().includes(query.trim().toLowerCase())

export const searchWikiArticles = async (query: string) =>
  wikiSearchResultsFixture.filter(
    (result) =>
      matchesQuery(result.title, query) ||
      matchesQuery(result.content_snippet, query),
  )

export const getArticleSources = async (
  _articleId: string,
): Promise<WikiArticleSource[]> => wikiSourcesFixture

export const getWikiArticleBySlug = async (slug: string) => {
  if (slug === wikiReferenceArticleFixture.slug) {
    return wikiReferenceArticleFixture
  }

  if (slug === 'fire-separation-occupancy-exit-strategy') {
    return {
      article_id: 'storybook-article',
      slug,
      title: wikiArticleHeroFixture.title,
      ale_tests_you: wikiArticleHeroFixture.aleTestsYou,
    }
  }

  return null
}

export const getWikiArticleByTaxonomySlug = async (_taxonomySlug: string) =>
  null

export const getTaxonomyTree = async (
  _disciplineId: string,
): Promise<TaxonomyNode[]> => wikiSidebarNodesFixture

export const getActiveTaxonomyNode = async (slug: string) =>
  wikiSidebarNodesFixture.find((node) => node.slug === slug) ?? null

export const resolveArticleAndNode = async (slug: string) => ({
  article: await getWikiArticleBySlug(slug),
  node: wikiSidebarNodesFixture.find((node) => node.slug === slug) ?? null,
})

export const getBreadcrumbTrail = async (
  _nodeId: string,
  _disciplineId?: string,
): Promise<BreadcrumbItem[]> => wikiBreadcrumbsFixture

export const getArticleSiblings = async (_nodeId: string) => ({
  prev: null,
  next: null,
})
