import React from 'react'
import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

let articleAndNode: any
let relatedTree: any[]
let heroCalls: any[]
let journeyCalls: any[]

mock.module('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))

mock.module('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={typeof href === 'string' ? href : String(href)} {...props}>
      {children}
    </a>
  ),
}))

mock.module('@/components/wiki', () => ({
  WikiArticle: () => <article data-testid="wiki-article" />,
  WikiArticleSkeleton: () => <div data-testid="wiki-skeleton" />,
  getArticleHeadings: (article: any) => [
    { id: 'first-section', text: 'First Section', level: 2 },
    ...(article.content?.includes('Second Section')
      ? [{ id: 'second-section', text: 'Second Section', level: 2 }]
      : []),
  ],
  WikiArticleHero: (props: any) => {
    heroCalls.push(props)
    return (
      <section data-testid="hero">
        {props.subject}|{props.difficulty}|{props.readTime}|{props.updatedNote}|{props.leaTestsYou}
      </section>
    )
  },
  WikiLearningJourney: (props: any) => {
    journeyCalls.push(props)
    return <section data-testid="learning-journey">{props.whyItMatters}</section>
  },
  WikiLearningCompletion: () => <section data-testid="learning-completion" />,
  WikiHeader: () => <header data-testid="wiki-header" />,
  WikiRightSidebar: ({ headings, sources }: any) => (
    <aside data-testid="wiki-sidebar">
      {headings.length} headings · {sources.length} sources
    </aside>
  ),
  WikiRightSidebarSkeleton: () => <div data-testid="right-sidebar-skeleton" />,
  WrongAnswerBanner: () => <div data-testid="wrong-answer" />,
  WikiReadTracker: () => <div data-testid="read-tracker" />,
}))

mock.module('@/lib/actions/cached-queries', () => ({
  getCachedArticleAndNodeById: async () => articleAndNode,
  getCachedTaxonomyTreeByDiscipline: async () => relatedTree,
}))

mock.module('@/lib/actions/wiki-actions', () => ({
  getArticleSources: async () => [],
  getArticleSiblings: async () => ({ prev: null, next: null }),
}))

mock.module('@/lib/actions/ei-prompts', () => ({
  getEIPromptsForArticle: async () => [],
  getUserEIResponsesForArticle: async () => ({}),
}))

mock.module('@/lib/demo/config', () => ({
  isDemoMode: () => false,
}))

mock.module('@/lib/routes', () => ({
  ROUTES: {
    quiz: { setup: (mode: string) => `/dashboard/quiz/${mode}/setup` },
    wiki: { article: (articleId: string) => `/dashboard/wiki/${articleId}` },
  },
}))

mock.module('@/types/testing', () => ({
  getSubjectName: (subject?: string | null) => (subject ? `Subject:${subject}` : ''),
}))

mock.module('@/lib/wiki-markdown', () => ({
  estimateReadingTime: () => 7,
}))

const pageModule = await import('./page')
const WikiArticlePage = pageModule.default
const { generateMetadata } = pageModule

const baseArticle = {
  article_id: 'article-1',
  title: 'Accessible Route Design',
  slug: 'accessible-route-design',
  content: '## First Section\nLearn progressively.\n## Second Section\nApply it.',
  updated_at: '2026-04-01T00:00:00.000Z',
}

const baseNode = {
  node_id: 'node-1',
  name: 'Accessible routes',
  subject_area: 'design',
  difficulty: 2,
  level: 3,
  description: 'Use route constraints to solve design problems.',
  discipline_id: 'discipline-1',
  parent_id: null,
}

async function renderArticlePage() {
  const element = await WikiArticlePage({
    params: Promise.resolve({ articleId: 'article-1' }),
    searchParams: Promise.resolve({}),
  })
  return renderToStaticMarkup(element as React.ReactElement)
}

describe('WikiArticlePage metadata fallbacks', () => {
  beforeEach(() => {
    heroCalls = []
    journeyCalls = []
    relatedTree = []
    articleAndNode = {
      article: { ...baseArticle },
      node: { ...baseNode },
    }
  })

  test('uses explicit article learning metadata when available', async () => {
    articleAndNode.article = {
      ...baseArticle,
      subject_label: 'LEA-DSGN · Accessibility',
      difficulty_label: 'Advanced',
      read_time: '12 min read',
      updated_note: 'Updated for the 2024 Revised IRR',
      lea_tests_you: 'Apply accessible route constraints to exam scenarios.',
    }

    const markup = await renderArticlePage()

    expect(markup).toContain('data-testid="learning-journey"')
    expect(heroCalls[0]).toMatchObject({
      subject: 'LEA-DSGN · Accessibility',
      difficulty: 'Advanced',
      readTime: '12 min',
      updatedNote: 'Updated for the 2024 Revised IRR',
      leaTestsYou: 'Apply accessible route constraints to exam scenarios.',
    })
    expect(journeyCalls[0]).toMatchObject({
      subject: 'LEA-DSGN · Accessibility',
      difficulty: 'Advanced',
      readTime: '12 min',
      whyItMatters: 'Apply accessible route constraints to exam scenarios.',
    })
  })

  test('generates route metadata from explicit article learning metadata', async () => {
    articleAndNode.article = {
      ...baseArticle,
      subject_label: 'LEA-DSGN · Accessibility',
      difficulty_label: 'Advanced',
      lea_tests_you: 'Apply accessible route constraints to exam scenarios.',
    }

    const metadata = await generateMetadata({
      params: Promise.resolve({ articleId: 'article-1' }),
    })

    expect(metadata).toMatchObject({
      title: 'Accessible Route Design | SlateCamp Wiki',
      description: 'Apply accessible route constraints to exam scenarios.',
      robots: { index: false, follow: false },
      other: {
        'slatecamp:wiki-subject': 'LEA-DSGN · Accessibility',
        'slatecamp:wiki-difficulty': 'Advanced',
      },
    })
  })

  test('derives safe learning metadata when optional article fields are missing', async () => {
    articleAndNode.article = {
      ...baseArticle,
      subject_label: null,
      difficulty_label: null,
      read_time: null,
      updated_note: null,
      lea_tests_you: null,
    }

    await renderArticlePage()

    expect(heroCalls[0]).toMatchObject({
      subject: 'Subject:design',
      difficulty: 'Intermediate',
      readTime: '7 min',
      updatedNote: 'Updated Apr 1, 2026',
      leaTestsYou: 'Use route constraints to solve design problems.',
    })
    expect(journeyCalls[0]).toMatchObject({
      whyItMatters: 'Use route constraints to solve design problems.',
      nodeName: 'Accessible routes',
      headings: [
        { id: 'first-section', text: 'First Section', level: 2 },
        { id: 'second-section', text: 'Second Section', level: 2 },
      ],
    })
  })

  test('generates route metadata fallbacks without inventing article facts', async () => {
    articleAndNode.article = {
      ...baseArticle,
      subject_label: null,
      difficulty_label: null,
      lea_tests_you: null,
    }

    const metadata = await generateMetadata({
      params: Promise.resolve({ articleId: 'article-1' }),
    })

    expect(metadata).toMatchObject({
      title: 'Accessible Route Design | SlateCamp Wiki',
      description: 'Use route constraints to solve design problems.',
      robots: { index: false, follow: false },
      other: {
        'slatecamp:wiki-subject': 'Subject:design',
        'slatecamp:wiki-difficulty': 'Intermediate',
      },
    })
  })

  test('generates no-index metadata for missing articles', async () => {
    articleAndNode = { article: null, node: null }

    await expect(generateMetadata({
      params: Promise.resolve({ articleId: 'missing-article' }),
    })).resolves.toMatchObject({
      title: 'Wiki Article Not Found | SlateCamp',
      robots: { index: false, follow: false },
    })
  })
})
