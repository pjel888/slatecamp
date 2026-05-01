import { describe, test, expect } from 'bun:test'
import {
  LEGACY_QUIZ_ROUTES,
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

  test('treats /dashboard/quiz as the canonical quiz hub route', () => {
    expect(ROUTES.quiz.root).toBe('/dashboard/quiz')
    expect(ROUTES.dashboard.quiz).toBe('/dashboard/quiz')
    expect(ROUTES.dashboard.drills).toBe('/dashboard/quiz')
    expect(getPageTitle('/dashboard/quiz')).toBe('Quiz')
  })

  test('returns "Quiz Session" for canonical quiz session URLs', () => {
    expect(ROUTES.quiz.session('session-123')).toBe('/dashboard/quiz/session/session-123')
    expect(ROUTES.dashboard.quizSession('session-123')).toBe('/dashboard/quiz/session/session-123')
    expect(getPageTitle('/dashboard/quiz/session/session-123')).toBe('Quiz Session')
  })

  test('collapses legacy modeful helper calls onto the dashboard session route', () => {
    expect(ROUTES.quiz.session('custom', 'session-123')).toBe(
      '/dashboard/quiz/session/session-123',
    )
    expect(ROUTES.quiz.results('custom', 'session-123')).toBe(
      '/dashboard/quiz/session/session-123/results',
    )
  })

  test('keeps explicit legacy quiz route constants for redirects and old deep links', () => {
    expect(LEGACY_QUIZ_ROUTES.root).toBe('/quiz')
    expect(LEGACY_QUIZ_ROUTES.session('session-123')).toBe('/quiz/session/session-123')
    expect(LEGACY_QUIZ_ROUTES.modeResults('custom', 'session-123')).toBe(
      '/quiz/custom/session/session-123/results',
    )
    expect(getPageTitle('/quiz')).toBe('Quiz')
    expect(getPageTitle('/quiz/session/session-123')).toBe('Quiz Session')
  })

  test('returns exact title for dashboard quiz sessions history', () => {
    expect(ROUTES.quiz.sessions).toBe('/dashboard/quiz/sessions')
    expect(getPageTitle('/dashboard/quiz/sessions')).toBe('Quiz Sessions')
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
