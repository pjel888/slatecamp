<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# shared

## Purpose

Cross-cutting reusable components used throughout the app: theme provider, navigation structure (navbar, sidebar with rail+overlay pattern), header, progress tracking, info tooltips, loading states, error boundaries. Most are client components; some wrap server layouts.

## Key Files

| File | Description |
|------|-------------|
| `ThemeProvider.tsx` | Next-themes provider wrapper: light/dark mode with system detection. Usually in root layout. |
| `ThemeToggle.tsx` | Sun/Moon icon button to switch theme. Calls `setTheme()` from useTheme hook. |
| `Navbar.tsx` | Top navigation: logo, nav items (Dashboard, Wiki, Quiz, etc.), theme toggle, user menu. Rail+sheet pattern for mobile. |
| `Sidebar.tsx` | Main sidebar: user avatar, tier badge, navigation links, collapsible via Sheet on mobile. Links to main routes (ROUTES constants). |
| `DashboardHeader.tsx` | Page header: breadcrumb or page title, optional action buttons. Reused across dashboard pages. |
| `NavigationProgress.tsx` | Progress bar: top-of-page loading indicator. Triggered on route changes via router events. |
| `NotificationBell.tsx` | Bell icon: click opens notification popover. Shows unread count badge. Fetches from notifications table. |
| `LogoutButton.tsx` | Logout action: calls Supabase signOut, redirects to /login. Integrated into user menu. |
| `Omnibar.tsx` | Command palette: global search input (topics, questions, articles). Keyboard shortcut (Cmd+K). |
| `QuickActionsBar.tsx` | Floating action bar: shortcuts to common tasks (start quiz, jump to 3D Lab, etc.). |
| `InfoTooltip.tsx` | Help icon + tooltip: explains UI concepts (e.g., "Readiness Score is your composite mastery %ile"). Reusable across pages. |
| `StandardInfoPopover.tsx` | Info icon + popover (wider/taller than tooltip): detailed explanations with links. |
| `TierBadge.tsx` | User tier badge: Free/Pro/Enterprise. Shows next tier benefits on hover. |
| `TransitionLink.tsx` | Next Link wrapper with page transition animation (fade out → navigate → fade in). Respects prefers-reduced-motion. |
| `DashboardPageSkeleton.tsx` | Loading skeleton for full pages: header placeholder + grid of card skeletons. |

## Subdirectories

None.

## For AI Agents

### Working In This Directory

1. **ThemeProvider setup.** All components in Navbar/Sidebar assume ThemeProvider wraps the app root. Do not add theme logic to individual components.

2. **Navigation pattern (rail + overlay).** On desktop, Navbar is horizontal, Sidebar is optional right-rail. On mobile (<md breakpoint), both collapse into sheet overlays triggered by hamburger icon. See Sidebar/Navbar for implementation.

3. **useTheme hook.** Access theme state via `const { theme, setTheme } = useTheme()`. Only available inside ThemeProvider boundary.

4. **Supabase auth context.** Navbar and LogoutButton use `useAuth()` or similar auth context hook (check @/lib/context/ for exact hook name). This provides user, session, signOut methods.

5. **Router integration.** NavigationProgress hooks into Next.js router events (`routeChangeStart`, `routeChangeComplete`). Do not add manual route-based logic to other components.

6. **No route logic inside shared components.** All navigation logic lives in ROUTES constants (@/lib/constants/routes.ts). Sidebar/Navbar reference these constants only.

### Common Patterns

**Theme toggle in layout:**
```tsx
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { Navbar } from '@/components/shared/Navbar'

export const RootLayout = ({ children }) => (
  <ThemeProvider>
    <Navbar />
    {children}
  </ThemeProvider>
)
```

**Sidebar with sheet on mobile:**
```tsx
// Sidebar.tsx uses Sheet internally:
const [isOpen, setIsOpen] = useState(false)
return (
  <>
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <SidebarSimple />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        {/* nav items */}
      </SheetContent>
    </Sheet>
  </>
)
```

**Info tooltip for readiness score:**
```tsx
import { InfoTooltip } from '@/components/shared/InfoTooltip'

<div className="flex items-center gap-1">
  <span className="text-sm font-bold">Readiness: 72%</span>
  <InfoTooltip text="Your composite mastery score based on quiz performance and spaced repetition." />
</div>
```

**Conditional navigation based on tier:**
```tsx
import { TierBadge } from '@/components/shared/TierBadge'

const { user } = useAuth()
return (
  <div>
    <TierBadge tier={user?.subscription_tier} />
    {user?.subscription_tier !== 'free' && (
      <Link href={ROUTES.THREE_D_LAB}>3D Lab</Link>
    )}
  </div>
)
```

**Page transition on navigation:**
```tsx
import { TransitionLink } from '@/components/shared/TransitionLink'

<TransitionLink href={ROUTES.QUIZ}>
  <Button>Start Quiz</Button>
</TransitionLink>
```

**Dashboard page skeleton while loading:**
```tsx
import { DashboardPageSkeleton } from '@/components/shared/DashboardPageSkeleton'

export const MyPage = async () => {
  const data = await fetchData() // May take time
  return <DashboardPageSkeleton />
}
```

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/constants/routes` | ROUTES object: all route strings (DASHBOARD, QUIZ, THREE_D_LAB, etc.) |
| `@/lib/context/*` | Auth context hooks, active session context |
| `@/components/ui/*` | Button, Sheet, Dialog, Tooltip, Badge, etc. |
| `@/lib/utils` | cn() for conditional styling |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **next-themes** | ThemeProvider, useTheme hook | ^0.4.6 |
| **@supabase/supabase-js** | Auth (signOut) via client in LogoutButton | ^2.98.0 |
| **next/navigation** | useRouter, usePathname for routing | 16.1.6 |
| **react** | Hooks: useState, useEffect | ^19.2.4 |
| **@phosphor-icons/react** | Icons: Sun, Moon, Bell, SidebarSimple, etc. | ^1.4.14 |
| **framer-motion** | Page transition animations (TransitionLink) | ^12.35.2 |

<!-- MANUAL: -->
