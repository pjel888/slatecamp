import { PortalTopbar } from './PortalTopbar'
import { PortalSidebar, type NavGroup } from './PortalSidebar'
import { MobileNav } from './MobileNav'

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
      <main className="flex-1 min-w-0 overflow-y-auto px-6 py-6 lg:px-8">
        {children}
      </main>
    </div>
  </div>
)

export { PortalLayout }
export type { PortalLayoutProps }
