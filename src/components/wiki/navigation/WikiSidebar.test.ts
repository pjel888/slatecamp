import { describe, expect, test } from 'bun:test'
import { shouldFetchClientTaxonomy } from './WikiSidebar'
import type { TaxonomyNode } from '@/lib/actions/taxonomy'

const seededNodes: TaxonomyNode[] = [
  {
    node_id: '00000000-0000-4000-8000-000000000104',
    discipline_id: '00000000-0000-4000-8000-000000000101',
    parent_id: '00000000-0000-4000-8000-000000000102',
    level: 2,
    name: 'LEA Foundations',
    subject_area: 'Building Code',
    is_leaf: true,
    slug: 'demo-ale-foundations',
  },
]

describe('WikiSidebar client taxonomy fetch gate', () => {
  test('skips client taxonomy fetch when server-fed nodes are present', () => {
    expect(shouldFetchClientTaxonomy(seededNodes)).toBe(false)
  })

  test('fetches taxonomy client-side when no initial nodes are provided', () => {
    expect(shouldFetchClientTaxonomy(undefined)).toBe(true)
    expect(shouldFetchClientTaxonomy([])).toBe(true)
  })
})
