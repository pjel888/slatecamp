import { describe, test, expect } from 'bun:test'
import {
  GROUPED_NAVIGATION,
  STATIC_PAGE_TITLES,
  getPageTitle,
} from '../routes'

describe('GROUPED_NAVIGATION', () => {
  test('dashboard is a standalone item with path /dashboard', () => {
    expect(GROUPED_NAVIGATION.dashboard.href).toBe('/dashboard')
    expect(GROUPED_NAVIGATION.dashboard.label).toBe('Dashboard')
  })

  test('contains exactly 3 groups', () => {
    expect(GROUPED_NAVIGATION.groups).toHaveLength(3)
  })

  test('groups are ordered learn, practice, data', () => {
    const keys = GROUPED_NAVIGATION.groups.map((g) => g.config.key)
    expect(keys).toEqual(['learn', 'practice', 'data'])
  })

  test('Learn group has label "Learn" and contains wiki, notes, 3d-lab', () => {
    const learn = GROUPED_NAVIGATION.groups.find((g) => g.config.key === 'learn')!
    expect(learn.config.label).toBe('Learn')
    const paths = learn.items.map((item) => item.href)
    expect(paths).toContain('/dashboard/wiki')
    expect(paths).toContain('/dashboard/notes')
    expect(paths).toContain('/dashboard/3d-lab')
    expect(learn.items).toHaveLength(3)
  })

  test('Practice group has label "Practice" and contains camptrails first, review second', () => {
    const practice = GROUPED_NAVIGATION.groups.find((g) => g.config.key === 'practice')!
    expect(practice.config.label).toBe('Practice')
    expect(practice.items).toHaveLength(2)
    expect(practice.items[0].href).toBe('/dashboard/camptrails')
    expect(practice.items[1].href).toBe('/dashboard/review')
  })

  test('Data group has label "Data" and contains analytics', () => {
    const data = GROUPED_NAVIGATION.groups.find((g) => g.config.key === 'data')!
    expect(data.config.label).toBe('Data')
    expect(data.items).toHaveLength(1)
    expect(data.items[0].href).toBe('/dashboard/analytics')
  })

  test('settings is a standalone bottom item with label "Settings"', () => {
    expect(GROUPED_NAVIGATION.settings.href).toBe('/dashboard/settings')
    expect(GROUPED_NAVIGATION.settings.label).toBe('Settings')
  })
})

describe('STATIC_PAGE_TITLES regression', () => {
  test('settings title remains "Account Settings" (not shortened to "Settings")', () => {
    expect(STATIC_PAGE_TITLES['/dashboard/settings']).toBe('Account Settings')
  })
})

describe('getPageTitle regression', () => {
  test('returns "Dashboard" for /dashboard', () => {
    expect(getPageTitle('/dashboard')).toBe('Dashboard')
  })

  test('returns "Knowledge Wiki" for /dashboard/wiki/some-slug', () => {
    expect(getPageTitle('/dashboard/wiki/some-slug')).toBe('Knowledge Wiki')
  })
})
