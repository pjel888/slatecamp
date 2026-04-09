import {
  Terminal,
  Database,
  FileText,
  TestTube,
  Scroll,
} from '@phosphor-icons/react/dist/ssr'
import { ROUTES } from '@/lib/routes'

export const DEV_NAV_ITEMS = [
  { href: ROUTES.DEVELOPER_CONSOLE, label: 'Console', icon: Terminal },
  { href: ROUTES.DEVELOPER_TEST_DATA, label: 'Test Data', icon: TestTube },
  { href: ROUTES.DEVELOPER_DOCS, label: 'Docs', icon: FileText },
  { href: ROUTES.DEVELOPER_DB, label: 'Database', icon: Database },
  { href: ROUTES.DEVELOPER_LOGS, label: 'Logs', icon: Scroll },
]
