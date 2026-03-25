import { PortalTopbar } from './PortalTopbar'
import { PortalSidebar, type NavGroup } from './PortalSidebar'
import { MobileNav } from './MobileNav'
import { cn } from '@/lib/utils'

interface PortalLayoutProps {
  portalLabel: string
  topbarBg: string
  accentColor: string
  accentLightColor: string
  navItems: NavGroup[]
  rightContent?: React.ReactNode
  searchComponent?: React.ReactNode
  backHref?: string
  backLabel?: string
  rightRail?: React.ReactNode
  children: React.ReactNode
}

const PortalLayout = ({
  portalLabel,
  topbarBg,
  accentColor,
  accentLightColor,
  navItems,
  rightContent,
  searchComponent,
  backHref,
  backLabel,
  rightRail,
  children,
}: PortalLayoutProps) => (
  <div className="flex flex-col min-h-screen">
    <PortalTopbar
      portalLabel={portalLabel}
      topbarBg={topbarBg}
      rightContent={rightContent}
      searchComponent={searchComponent}
      backHref={backHref}
      backLabel={backLabel}
      mobileNav={
        <MobileNav
          navItems={navItems}
          accentColor={accentColor}
          accentLightColor={accentLightColor}
          portalLabel={portalLabel}
        />
      }
    />
    <div className="flex flex-1">
      <PortalSidebar
        navItems={navItems}
        accentColor={accentColor}
        accentLightColor={accentLightColor}
      />
      <div className="flex flex-1 min-w-0">
        <main className={cn("flex-1 min-w-0 overflow-y-auto px-6 py-6 lg:px-8", rightRail && "max-w-4xl")}>
          {children}
        </main>
        {rightRail && (
          <aside className="w-[170px] shrink-0 sticky top-12 h-fit hidden xl:block py-5 pr-4">
            {rightRail}
          </aside>
        )}
      </div>
    </div>
  </div>
)

export { PortalLayout }
export type { PortalLayoutProps }
