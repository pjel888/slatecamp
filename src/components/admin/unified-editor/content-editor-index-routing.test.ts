import { describe, expect, test } from 'bun:test'
import { buildContentEditorIndexHref } from './content-editor-index-routing'

describe('buildContentEditorIndexHref', () => {
  test('keeps question-bank state on the question-bank route', () => {
    expect(
      buildContentEditorIndexHref({
        basePath: '/admin/knowledge/questions',
        currentSearch: 'search=stairs',
        mode: 'questions',
        topic: 'topic-1',
      }),
    ).toBe('/admin/knowledge/questions?search=stairs&view=questions&topic=topic-1')
  })

  test('drops the topic filter when clearing selection', () => {
    expect(
      buildContentEditorIndexHref({
        basePath: '/admin/knowledge/questions',
        currentSearch: 'view=questions&topic=topic-1',
        mode: 'questions',
        topic: null,
      }),
    ).toBe('/admin/knowledge/questions?view=questions')
  })
})
