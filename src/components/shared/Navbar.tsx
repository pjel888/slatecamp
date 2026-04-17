'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SlateCampLogo } from '@/components/graphics/logos/SlateCampLogo'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import {
  SquaresFour,
  Brain,
  ChartBar,
  Books,
  Cube,
  GearSix,
  List,
  ShieldCheck,
  ClipboardText,
  BookOpen,
  Globe,
  Path,
} from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { ROUTES } from '@/lib/routes'

const NAV_ITEMS = [
  { href: ROUTES.dashboard.root, label: 'Dashboard', icon: SquaresFour },
  { href: ROUTES.wiki.root, label: 'Wiki', icon: Globe },
  { href: ROUTES.dashboard.drills, label: 'Quiz', icon: Brain },
  { href: ROUTES.dashboard.drillsSessions, label: 'Sessions', icon: ClipboardText },
  { href: ROUTES.dashboard.camptrails, label: 'CampTrails', icon: Path },
  { href: ROUTES.dashboard.drills, label: 'Review', icon: BookOpen },
  { href: ROUTES.dashboard.analytics, label: 'Analytics', icon: ChartBar },
  { href: ROUTES.dashboard.library, label: 'Library', icon: Books },
  { href: ROUTES.lab.root, label: '3D Lab', icon: Cube },
  { href: ROUTES.dashboard.settings, label: 'Settings', icon: GearSix },
]

interface NavbarProps {
  isAdmin?: boolean
}

export function Navbar({ isAdmin }: NavbarProps) {
  const pathname = usePathname()

  return (
    <header className='flex h-12 items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur-xl lg:hidden'>
      <Link
        href={ROUTES.dashboard.root}
        className='transition-colors duration-150 hover:opacity-80'
      >
        <SlateCampLogo size="md" />
      </Link>

      <div className='flex items-center gap-2'>
        <ThemeToggle />
        <Sheet>
          <SheetTrigger
            render={<Button variant='ghost' size='icon' className='h-9 w-9' />}
          >
            <SCIcon icon={List} size='base' />
          </SheetTrigger>
          <SheetContent side='right' className='w-[280px] p-0'>
            <SheetTitle className='sr-only'>Navigation</SheetTitle>
            <nav className='space-y-1 px-3 py-4'>
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive =
                  pathname === href ||
                  (href !== ROUTES.dashboard.root && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${isActive
                        ? 'bg-secondary font-medium text-foreground'
                        : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                      }`}
                  >
                    <SCIcon icon={Icon} size='base' />
                    {label}
                  </Link>
                )
              })}

              {isAdmin && (
                <>
                  <div className='my-2 border-t border-border' />
                  <Link
                    href={ROUTES.dashboard.settingsDeveloper}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${pathname === ROUTES.dashboard.settingsDeveloper
                        ? 'bg-warning/10 font-medium text-warning'
                        : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                      }`}
                  >
                    <SCIcon icon={ShieldCheck} size='base' />
                    Dev Settings
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
