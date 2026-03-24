import { describe, test, expect } from 'bun:test'
import {
  STATIC_PAGE_TITLES,
  getPageTitle,
} from '../routes'

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
