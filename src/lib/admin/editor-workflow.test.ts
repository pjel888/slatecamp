import { describe, expect, test } from 'bun:test'

import {
  getStatusWriteCandidates,
  normalizeEditorStatus,
} from './editor-workflow'

describe('editor workflow status compatibility', () => {
  test('normalizes only canonical editor statuses', () => {
    expect(normalizeEditorStatus('in_review')).toBe('in_review')
    expect(normalizeEditorStatus('review')).toBe('draft')
    expect(normalizeEditorStatus('pending_review')).toBe('draft')
  })

  test('emits canonical-only status writes for review submissions', () => {
    expect(getStatusWriteCandidates('in_review')).toEqual(['in_review'])
    expect(getStatusWriteCandidates('pending_review')).toEqual(['draft'])
    expect(getStatusWriteCandidates('published')).toEqual(['published'])
  })
})
