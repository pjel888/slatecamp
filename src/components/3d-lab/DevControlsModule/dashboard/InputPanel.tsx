'use client'

// ─── Input Panel (Left Panel — Tabbed) ─────────────────────────────────────
// Replaces the single-scroll LeftToolbar with 3 organized tabs:
//   Tab 1 (Lot): Presets + Lot Dimensions + Zoning Classification
//   Tab 2 (Building): FLAR + BHL + Proposed Building + Firewall
//   Tab 3 (Settings): Display toggles, export

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Ruler, Building2, Settings } from 'lucide-react'
import { PresetSelector } from './PresetSelector'
import { LotInputPanel } from './LotInputPanel'
import { ZoningInputPanel } from './ZoningInputPanel'
import { FlarPanel } from './FlarPanel'
import { BhlPanel } from './BhlPanel'
import { FirewallPanel } from './FirewallPanel'
import { ProposedBuildingPanel } from './ProposedBuildingPanel'
import { SettingsTab } from './tabs/SettingsTab'
import type { InputTab } from '../hooks/usePanelState'

interface InputPanelProps {
  activeTab: InputTab
  onTabChange: (tab: InputTab) => void
}

export function InputPanel({ activeTab, onTabChange }: InputPanelProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as InputTab)}
      className="flex h-full flex-col"
    >
      <TabsList variant="segmented" className="mx-3 mt-3 shrink-0">
        <TabsTrigger value="lot" className="gap-1 text-[10px]">
          <Ruler size={12} />
          Lot
        </TabsTrigger>
        <TabsTrigger value="building" className="gap-1 text-[10px]">
          <Building2 size={12} />
          Build
        </TabsTrigger>
        <TabsTrigger value="settings" className="gap-1 text-[10px]">
          <Settings size={12} />
          Settings
        </TabsTrigger>
      </TabsList>

      {/* Tab 1: Lot — Site Parameters */}
      <TabsContent value="lot" className="flex-1 overflow-y-auto p-3">
        <div className="space-y-4">
          <PresetSelector />
          <hr className="border-border" />
          <LotInputPanel />
          <ZoningInputPanel />
        </div>
      </TabsContent>

      {/* Tab 2: Building — Proposed Building & Code Limits */}
      <TabsContent value="building" className="flex-1 overflow-y-auto p-3">
        <div className="space-y-4">
          <FlarPanel />
          <hr className="border-border" />
          <BhlPanel />
          <hr className="border-border" />
          <ProposedBuildingPanel />
          <FirewallPanel />
        </div>
      </TabsContent>

      {/* Tab 3: Settings */}
      <TabsContent value="settings" className="flex-1 overflow-y-auto p-3">
        <SettingsTab />
      </TabsContent>
    </Tabs>
  )
}
