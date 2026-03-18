import { DocSection } from '@/components/developer/DocSection'

export default function DeveloperDocsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-lg font-bold text-foreground">Architecture Docs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Internal architecture documentation and system design references.
        </p>
      </div>

      <div className="space-y-4">
        <DocSection
          title="Feature Flag System"
          description="3-layer resolution: dev override > DB value > config default. Server components fetch DB values and pass as props. Client components add dev overrides via Zustand store."
        />
        <DocSection
          title="Impersonation Engine"
          description="Session-storage-backed Zustand store with 6 presets (B2C/B2B2C/B2B user types). Clears on tab close for security. Only available in development mode or to super_admin users."
        />
        <DocSection
          title="Multi-Tenant Architecture"
          description="Organizations table with junction table for membership. Supports regular, educational, and corporate user types. RLS policies ensure members can only see their own org data."
        />
        <DocSection
          title="Tier System"
          description="4 tiers: free, camp, insurance, institutional. Each tier grants specific capabilities (AI tokens, 3D lab, SRS). Dev toolbar allows tier simulation via cookie-based feature flags."
        />
      </div>
    </div>
  )
}
