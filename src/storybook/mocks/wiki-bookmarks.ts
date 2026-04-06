import { wikiBookmarksFixture } from '@/storybook/fixtures/wiki'

export interface WikiBookmarkRow {
  article_id: string
  slug: string
  title: string
  created_at: string
}

export const getWikiBookmarks = async (): Promise<WikiBookmarkRow[]> =>
  wikiBookmarksFixture

export const addWikiBookmark = async (_articleId: string) => true

export const removeWikiBookmark = async (_articleId: string) => true
