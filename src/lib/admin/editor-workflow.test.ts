import { describe, expect, test } from 'bun:test'

import {
  getStatusWriteCandidates,
  isLegacyStatusConstraintError,
  normalizeEditorStatus,
} from './editor-workflow'

describe('editor workflow status compatibility', () => {
  test('normalizes legacy review aliases to the canonical in_review status', () => {
    expect(normalizeEditorStatus('review')).toBe('in_review')
    expect(normalizeEditorStatus('pending_review')).toBe('in_review')
  })

  test('emits canonical status first and legacy pending_review as explicit fallback', () => {
    expect(getStatusWriteCandidates('in_review')).toEqual(['in_review', 'pending_review'])
    expect(getStatusWriteCandidates('published')).toEqual(['published'])
  })

  test('detects legacy status constraint failures', () => {
    expect(isLegacyStatusConstraintError({ code: '23514', message: 'constraint failed' })).toBe(true)
    expect(isLegacyStatusConstraintError({ message: 'status constraint mismatch' })).toBe(true)
    expect(isLegacyStatusConstraintError({ message: 'other failure' })).toBe(false)
  })
})
