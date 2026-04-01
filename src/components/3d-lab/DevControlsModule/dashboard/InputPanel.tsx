'use client'

// ─── Input Panel (Left Panel — Tabbed, Dual-Column) ────────────────────────
// Two-column grid layout per tab:
//   Left column: interactive controls (sliders, dropdowns, toggles)
//   Right column: information readouts (metrics, tables, summaries)
// Settings tab remains single-column.

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Ruler, Building2, Settings } from 'lucide-react'

// Split components — controls (left) and info (right)
import { LotControls } from './splits/LotControls'
import { LotSummary } from './splits/LotSummary'
import { ZoneSelector } from './splits/ZoneSelector'
import { ZoneTableRef } from './splits/ZoneTableRef'
import { FlarControls } from './splits/FlarControls'
import { FlarInfo } from './splits/FlarInfo'
import { BhlControls } from './splits/BhlControls'
import { BhlInfo } from './splits/BhlInfo'

// Full-width components (not split)
import { PresetSelector } from './PresetSelector'
import { ProposedBuildingPanel } from './ProposedBuildingPanel'
import { SetbackInfoPanel } from './SetbackInfoPanel'
import { FirewallPanel } from './FirewallPanel'
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

      {/* ─── Tab 1: Lot — Dual Column ─── */}
      {/* Order: Zoning (governs Table VIII.1) → Lot Parameters → Presets (shortcuts last) */}
      <TabsContent value="lot" className="flex-1 overflow-y-auto p-3">
        {/* Two-column grid: controls left, info right */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left: Zoning first (dependency-first), then lot sliders */}
          <div className="space-y-5">
            <ZoneSelector />
            <LotControls />
          </div>
          {/* Right: Zone table first (matches zoning), then lot summary */}
          <div className="space-y-4">
            <ZoneTableRef />
            <LotSummary />
          </div>
        </div>

        <hr className="my-3 border-border" />

        {/* Presets below primary controls — power-user shortcuts last */}
        <PresetSelector />
      </TabsContent>

      {/* ─── Tab 2: Building — Dual Column ─── */}
      <TabsContent value="building" className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-4">
          {/* Left: FLAR + BHL sliders */}
          <div className="space-y-4">
            <FlarControls />
            <hr className="border-border" />
            <BhlControls />
          </div>
          {/* Right: FLAR + BHL metrics */}
          <div className="space-y-4">
            <FlarInfo />
            <BhlInfo />
          </div>
        </div>

        <hr className="my-3 border-border" />

        {/* Building dimensions + setbacks — dual column */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <ProposedBuildingPanel />
            <FirewallPanel />
          </div>
          <div>
            <SetbackInfoPanel />
          </div>
        </div>
      </TabsContent>

      {/* ─── Tab 3: Settings — Single Column ─── */}
      <TabsContent value="settings" className="flex-1 overflow-y-auto p-3">
        <SettingsTab />
      </TabsContent>
    </Tabs>
  )
}
