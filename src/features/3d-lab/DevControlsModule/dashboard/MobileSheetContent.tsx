'use client'

// ─── Mobile Sheet Content ──────────────────────────────────────────────────
// 4-tab layout for the mobile bottom sheet:
//   Lot (= desktop Tab 1), Building (= desktop Tab 2),
//   Results (= desktop right panel sections 1-4), Settings (= desktop Tab 3)

import { useState } from 'react'
import { Ruler, Building2, BarChart3, Settings } from 'lucide-react'
import { PresetSelector } from './PresetSelector'
import { LotInputPanel } from './LotInputPanel'
import { ZoningInputPanel } from './ZoningInputPanel'
import { FlarPanel } from './FlarPanel'
import { BhlPanel } from './BhlPanel'
import { FirewallPanel } from './FirewallPanel'
import { ProposedBuildingPanel } from './ProposedBuildingPanel'
import { ComplianceSummary } from './ComplianceSummary'
import { AMBFThreeWayPanel } from './AMBFThreeWayPanel'
import { ClosureEquationStrip } from './ClosureEquationStrip'
import { ComplianceScorecard } from './ComplianceScorecard'
import { SettingsTab } from './tabs/SettingsTab'
import { ComputedHUD } from './DevControlsDashboard'

type MobileTab = 'lot' | 'building' | 'results' | 'settings'

const TABS: { value: MobileTab; label: string; icon: typeof Ruler }[] = [
  { value: 'lot', label: 'Lot', icon: Ruler },
  { value: 'building', label: 'Build', icon: Building2 },
  { value: 'results', label: 'Results', icon: BarChart3 },
  { value: 'settings', label: 'Settings', icon: Settings },
]

export function MobileSheetContent() {
  const [activeTab, setActiveTab] = useState<MobileTab>('lot')

  return (
    <div className="flex h-full flex-col">
      {/* KPI summary always visible */}
      <div className="shrink-0 px-3 pb-2">
        <ComputedHUD />
      </div>

      {/* Tab buttons */}
      <div className="flex shrink-0 border-b border-border">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex flex-1 items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors duration-150 ${
                active
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={12} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'lot' && (
          <div className="space-y-4">
            <PresetSelector />
            <hr className="border-border" />
            <LotInputPanel />
            <ZoningInputPanel />
          </div>
        )}

        {activeTab === 'building' && (
          <div className="space-y-4">
            <FlarPanel />
            <hr className="border-border" />
            <BhlPanel />
            <hr className="border-border" />
            <ProposedBuildingPanel />
            <FirewallPanel />
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-4">
            <ComplianceSummary />
            <hr className="border-border" />
            <AMBFThreeWayPanel />
            <hr className="border-border" />
            <ClosureEquationStrip />
            <hr className="border-border" />
            <ComplianceScorecard />
          </div>
        )}

        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}
