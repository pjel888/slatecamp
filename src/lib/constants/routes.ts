/**
 * Central route paths for Cerebro. Use these instead of hardcoded strings
 * for redirects, hrefs, and pathname checks.
 */

export const ROUTES = {
  HOME: "/",
  PRICING: "/pricing",
  ABOUT: "/about",
  CONTACT: "/contact",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard",
  SETTINGS: "/dashboard/settings",
  SETTINGS_BILLING: "/dashboard/settings/billing",
  SETTINGS_DEVELOPER: "/dashboard/settings/developer",
  QUIZ: "/dashboard/quiz",
  QUIZ_SESSION: (sessionId: string) => `/dashboard/quiz/${sessionId}`,
  QUIZ_SESSION_SUMMARY: (sessionId: string) => `/dashboard/quiz/${sessionId}/summary`,
  SESSIONS: "/dashboard/sessions",
  SESSIONS_NEW: "/dashboard/sessions/new",
  REVIEW: "/dashboard/review",
  REVIEW_EXITED: "/dashboard/review?exited=1",
  ANALYTICS: "/dashboard/analytics",
  CAMPTRAILS: "/dashboard/camptrails",
  WIKI: "/dashboard/wiki",
  WIKI_PAGE: (slug: string) => `/dashboard/wiki/${slug}`,
  WIKI_SUBJECT: (slug: string) => `/dashboard/wiki/subject/${slug}`,
  WIKI_SEARCH: (q: string, subject?: string) =>
    `/dashboard/wiki/search?q=${encodeURIComponent(q)}${subject ? `&subject=${subject}` : ''}`,
  NOTES: "/dashboard/notes",
  NOTE: (noteId: string) => `/dashboard/notes/${noteId}`,
  LIBRARY: "/dashboard/library",
  LIBRARY_SUBJECT: (subjectId: string) => `/dashboard/library/subject/${subjectId}`,
  LIBRARY_BANK: (bankId: string) => `/dashboard/library/bank/${bankId}`,
  LIBRARY_MARKETPLACE: "/dashboard/library/marketplace",
  THREE_D_LAB: "/dashboard/3d-lab",
  ADMIN: "/dashboard/admin",
  DEVELOPER: "/dashboard/developer",
  DEVELOPER_CONSOLE: "/dashboard/developer/console",
  DEVELOPER_TEST_DATA: "/dashboard/developer/test-data",
  DEVELOPER_DOCS: "/dashboard/developer/docs",
  DEVELOPER_DB: "/dashboard/developer/db",
  DEVELOPER_LOGS: "/dashboard/developer/logs",
  DEVELOPER_DESIGN_SYSTEM: "/dashboard/developer/design-system",
} as const;

/** Paths that do not require authentication (middleware). */
export const PUBLIC_PATHS: string[] = [
  ROUTES.HOME,
  ROUTES.PRICING,
  ROUTES.ABOUT,
  ROUTES.CONTACT,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  "/auth/callback",
  "/try",
];
