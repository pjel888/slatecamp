import { describe, test, expect } from 'bun:test'
import {
  PUBLIC_ROUTES,
  ROUTES,
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

  test('treats /quiz as the canonical quiz hub route', () => {
    expect(ROUTES.quiz.root).toBe('/quiz')
    expect(ROUTES.dashboard.drills).toBe('/quiz')
    expect(getPageTitle('/quiz')).toBe('Quiz')
  })

  test('returns "Quiz Session" for canonical quiz session URLs', () => {
    expect(ROUTES.quiz.session('session-123')).toBe('/quiz/session/session-123')
    expect(getPageTitle('/quiz/session/session-123')).toBe('Quiz Session')
  })

  test('keeps legacy modeful session helpers available for redirects and deep links', () => {
    expect(ROUTES.quiz.session('custom', 'session-123')).toBe(
      '/quiz/custom/session/session-123',
    )
    expect(ROUTES.quiz.results('custom', 'session-123')).toBe(
      '/quiz/custom/session/session-123/results',
    )
  })


  test('uses /tools as the canonical calculator namespace', () => {
    expect(ROUTES.calculators.root).toBe('/tools')
    expect(ROUTES.calculators.suiteRoot).toBe('/tools')
    expect(ROUTES.calculators.tool('chb')).toBe('/tools/chb')
    expect(ROUTES.calculators.legacySuiteRoot).toBe('/calculators')
    expect(ROUTES.calculators.legacyTool('chb')).toBe('/calculators/chb')
    expect(PUBLIC_ROUTES).toContain('/calculators')
    expect(PUBLIC_ROUTES).toContain('/calculators/chb')
  })

  test('returns "Knowledge Wiki" for /dashboard/wiki/some-slug', () => {
    expect(getPageTitle('/dashboard/wiki/some-slug')).toBe('Knowledge Wiki')
  })
})
