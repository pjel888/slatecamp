'use client'

import { useState } from 'react'
import { useWallConfigStore } from '../../store/useWallConfigStore'
import type { Layer } from '../../types/wall.types'

const BASIS_LABEL: Record<string, string> = {
  area: 'AREA / SIDE',
  piece: 'PIECE',
  linear: 'LINEAR',
  panel: 'PANEL / SIDE',
}

function TogglePill({
  enabled,
  onToggle,
  disabled,
}: {
  enabled: boolean
  onToggle: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={!disabled ? onToggle : undefined}
      disabled={disabled}
      className={`relative w-8 h-[18px] rounded-full transition-colors duration-150 flex-shrink-0 ${
        disabled ? 'cursor-default' : 'cursor-pointer'
      } ${enabled ? 'bg-primary' : 'bg-border'}`}
    >
      <span
        className={`absolute top-[2px] w-3.5 h-3.5 rounded-full bg-white transition-[left] duration-150 ${
          enabled ? 'left-[16px]' : 'left-[2px]'
        }`}
      />
    </button>
  )
}

function BasisBadge({ basis }: { basis: string }) {
  return (
    <span className="font-mono text-[8px] font-medium uppercase tracking-[0.08em] px-[7px] py-[3px] rounded bg-[#F2F0EB] text-text-secondary whitespace-nowrap">
      {BASIS_LABEL[basis] ?? basis.toUpperCase()}
    </span>
  )
}

interface LayerCardProps {
  layer: Layer
  alwaysOn?: boolean
  specLine: string
  onToggle?: () => void
  onWasteChange?: (val: number) => void
}

function LayerCard({ layer, alwaysOn, specLine, onToggle, onWasteChange }: LayerCardProps) {
  const wastePercent = Math.round(layer.wasteFactor * 100)

  return (
    <div
      className={`flex items-center gap-3 px-3.5 py-[11px] border border-border rounded-lg bg-white mb-1.5 transition-opacity duration-150 ${
        !layer.enabled && !alwaysOn ? 'opacity-45' : ''
      }`}
    >
      <TogglePill
        enabled={alwaysOn ? true : layer.enabled}
        onToggle={onToggle ?? (() => {})}
        disabled={alwaysOn}
      />

      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-text-primary">{layer.label}</div>
        <div className="text-[11px] text-text-secondary">{specLine}</div>
      </div>

      <BasisBadge basis={layer.basis} />

      <div className="flex items-center gap-1.5 shrink-0">
        <label className="font-mono text-[9px] uppercase text-text-tertiary">Waste</label>
        <input
          type="text"
          value={`${wastePercent}%`}
          disabled={alwaysOn}
          onChange={(e) => {
            const raw = e.target.value.replace('%', '').trim()
            const v = parseInt(raw, 10)
            if (!isNaN(v) && v >= 0 && v <= 99) {
              onWasteChange?.(v / 100)
            }
          }}
          className="font-mono text-[12px] w-11 border border-border rounded px-1.5 py-[3px] text-right bg-white disabled:cursor-default disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
  )
}

export function Step5Treatment() {
  const coreType = useWallConfigStore((s) => s.config.coreType)
  const layers = useWallConfigStore((s) => s.config.layers)
  const seamLengthLM = useWallConfigStore((s) => s.config.seamLengthLM)
  const toggleLayer = useWallConfigStore((s) => s.toggleLayer)
  const setLayerWaste = useWallConfigStore((s) => s.setLayerWaste)
  const setSeamLength = useWallConfigStore((s) => s.setSeamLength)
  const nextStep = useWallConfigStore((s) => s.nextStep)
  const prevStep = useWallConfigStore((s) => s.prevStep)

  const [seamInput, setSeamInput] = useState<string>(
    seamLengthLM !== undefined ? String(seamLengthLM) : ''
  )

  const getLayer = (code: string) => layers.find((l) => l.code === code)

  function handleSeamBlur() {
    const parsed = parseFloat(seamInput)
    if (!isNaN(parsed) && parsed >= 0) {
      setSeamLength(parsed)
    } else if (seamInput === '') {
      setSeamLength(undefined as unknown as number)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Structural & Element Refinements from Audit */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary">Treatment layers</h2>
        <p className="mt-0.5 text-xs text-text-secondary">
          Toggle the layers applicable to this wall. Order reflects construction sequence.
        </p>
      </div>

      <div>
        {coreType === 'chb' && (
          <>
            {getLayer('CHB_CORE') && (
              <LayerCard
                layer={{ ...getLayer('CHB_CORE')!, enabled: true }}
                alwaysOn
                specLine="0.40 m × 0.20 m face · 12.5 pcs/sqm"
                onWasteChange={(v) => setLayerWaste('CHB_CORE', v)}
              />
            )}
            {getLayer('PLASTER') && (
              <LayerCard
                layer={getLayer('PLASTER')!}
                specLine="Mix 1:2 · Thickness 12.7 mm · Dry-volume factor 1.33"
                onToggle={() => toggleLayer('PLASTER', !getLayer('PLASTER')!.enabled)}
                onWasteChange={(v) => setLayerWaste('PLASTER', v)}
              />
            )}
            {getLayer('SKIM_COAT') && (
              <LayerCard
                layer={getLayer('SKIM_COAT')!}
                specLine="Surface correction only · optional"
                onToggle={() => toggleLayer('SKIM_COAT', !getLayer('SKIM_COAT')!.enabled)}
                onWasteChange={(v) => setLayerWaste('SKIM_COAT', v)}
              />
            )}
          </>
        )}

        {coreType === 'drywall' && (
          <>
            {getLayer('GYP_BOARD') && (
              <LayerCard
                layer={getLayer('GYP_BOARD')!}
                specLine="2.973 sqm per board · 4′×8′"
                onToggle={() => toggleLayer('GYP_BOARD', !getLayer('GYP_BOARD')!.enabled)}
                onWasteChange={(v) => setLayerWaste('GYP_BOARD', v)}
              />
            )}
            {getLayer('JOINT_TAPE') && (
              <LayerCard
                layer={getLayer('JOINT_TAPE')!}
                specLine="Applied at seams and corners"
                onToggle={() => toggleLayer('JOINT_TAPE', !getLayer('JOINT_TAPE')!.enabled)}
                onWasteChange={(v) => setLayerWaste('JOINT_TAPE', v)}
              />
            )}
            {getLayer('JOINT_COMPOUND') && (
              <LayerCard
                layer={getLayer('JOINT_COMPOUND')!}
                specLine="Boysen · 12 lm/L"
                onToggle={() => toggleLayer('JOINT_COMPOUND', !getLayer('JOINT_COMPOUND')!.enabled)}
                onWasteChange={(v) => setLayerWaste('JOINT_COMPOUND', v)}
              />
            )}
            {getLayer('JOINT_COMPOUND') && (
              <div className="flex items-center gap-2 px-1 mb-1.5">
                <span className="font-mono text-[11px] text-text-secondary">Seam length:</span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={seamInput}
                  onChange={(e) => setSeamInput(e.target.value)}
                  onBlur={handleSeamBlur}
                  placeholder="auto"
                  className="font-mono text-[11px] w-16 border border-border rounded px-1.5 py-[3px] bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="font-mono text-[11px] text-text-secondary">lm</span>
                <span className="font-mono text-[11px] text-text-tertiary">(leave blank for auto-estimate)</span>
              </div>
            )}
          </>
        )}

        {coreType === 'plywood' && (
          <>
            {getLayer('PLY_SHEET') && (
              <LayerCard
                layer={getLayer('PLY_SHEET')!}
                specLine="2.973 sqm per sheet · 4′×8′ marine plywood"
                onToggle={() => toggleLayer('PLY_SHEET', !getLayer('PLY_SHEET')!.enabled)}
                onWasteChange={(v) => setLayerWaste('PLY_SHEET', v)}
              />
            )}
            {getLayer('WOOD_FRAME') && (
              <LayerCard
                layer={getLayer('WOOD_FRAME')!}
                specLine="2×3 lumber · studs @ 400mm o.c."
                onToggle={() => toggleLayer('WOOD_FRAME', !getLayer('WOOD_FRAME')!.enabled)}
                onWasteChange={(v) => setLayerWaste('WOOD_FRAME', v)}
              />
            )}
            {getLayer('NAILS') && (
              <LayerCard
                layer={getLayer('NAILS')!}
                specLine="Common wire nails · ~0.15 kg/sqm"
                onToggle={() => toggleLayer('NAILS', !getLayer('NAILS')!.enabled)}
                onWasteChange={(v) => setLayerWaste('NAILS', v)}
              />
            )}
          </>
        )}

        {coreType === 'cement-board' && (
          <>
            {getLayer('CB_SHEET') && (
              <LayerCard
                layer={getLayer('CB_SHEET')!}
                specLine="2.973 sqm per sheet · 4′×8′ fiber cement"
                onToggle={() => toggleLayer('CB_SHEET', !getLayer('CB_SHEET')!.enabled)}
                onWasteChange={(v) => setLayerWaste('CB_SHEET', v)}
              />
            )}
            {getLayer('JOINT_TAPE') && (
              <LayerCard
                layer={getLayer('JOINT_TAPE')!}
                specLine="Applied at seams and corners"
                onToggle={() => toggleLayer('JOINT_TAPE', !getLayer('JOINT_TAPE')!.enabled)}
                onWasteChange={(v) => setLayerWaste('JOINT_TAPE', v)}
              />
            )}
            {getLayer('JOINT_COMPOUND') && (
              <LayerCard
                layer={getLayer('JOINT_COMPOUND')!}
                specLine="Boysen · 12 lm/L"
                onToggle={() => toggleLayer('JOINT_COMPOUND', !getLayer('JOINT_COMPOUND')!.enabled)}
                onWasteChange={(v) => setLayerWaste('JOINT_COMPOUND', v)}
              />
            )}
            {getLayer('JOINT_COMPOUND') && (
              <div className="flex items-center gap-2 px-1 mb-1.5">
                <span className="font-mono text-[11px] text-text-secondary">Seam length:</span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={seamInput}
                  onChange={(e) => setSeamInput(e.target.value)}
                  onBlur={handleSeamBlur}
                  placeholder="auto"
                  className="font-mono text-[11px] w-16 border border-border rounded px-1.5 py-[3px] bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="font-mono text-[11px] text-text-secondary">lm</span>
                <span className="font-mono text-[11px] text-text-tertiary">(leave blank for auto-estimate)</span>
              </div>
            )}
            {getLayer('SKIM_COAT') && (
              <LayerCard
                layer={getLayer('SKIM_COAT')!}
                specLine="Surface correction only · optional"
                onToggle={() => toggleLayer('SKIM_COAT', !getLayer('SKIM_COAT')!.enabled)}
                onWasteChange={(v) => setLayerWaste('SKIM_COAT', v)}
              />
            )}
          </>
        )}

        {coreType === 'brick' && (
          <>
            {getLayer('BRICK_CORE') && (
              <LayerCard
                layer={{ ...getLayer('BRICK_CORE')!, enabled: true }}
                alwaysOn
                specLine="0.20 m × 0.10 m face · ~50 pcs/sqm"
                onWasteChange={(v) => setLayerWaste('BRICK_CORE', v)}
              />
            )}
            {getLayer('PLASTER') && (
              <LayerCard
                layer={getLayer('PLASTER')!}
                specLine="Mix 1:2 · Thickness 12.7 mm · Dry-volume factor 1.33"
                onToggle={() => toggleLayer('PLASTER', !getLayer('PLASTER')!.enabled)}
                onWasteChange={(v) => setLayerWaste('PLASTER', v)}
              />
            )}
            {getLayer('SKIM_COAT') && (
              <LayerCard
                layer={getLayer('SKIM_COAT')!}
                specLine="Surface correction only · optional"
                onToggle={() => toggleLayer('SKIM_COAT', !getLayer('SKIM_COAT')!.enabled)}
                onWasteChange={(v) => setLayerWaste('SKIM_COAT', v)}
              />
            )}
          </>
        )}

        {coreType === 'solid-concrete' && (
          <>
            {getLayer('ROUGHENING') && (
              <LayerCard
                layer={{ ...getLayer('ROUGHENING')!, enabled: true }}
                alwaysOn
                specLine="Surface preparation for concrete · labor only"
                onWasteChange={(v) => setLayerWaste('ROUGHENING', v)}
              />
            )}
            {getLayer('PLASTER') && (
              <LayerCard
                layer={getLayer('PLASTER')!}
                specLine="Mix 1:2 · Thickness 12.7 mm · Dry-volume factor 1.33"
                onToggle={() => toggleLayer('PLASTER', !getLayer('PLASTER')!.enabled)}
                onWasteChange={(v) => setLayerWaste('PLASTER', v)}
              />
            )}
            {getLayer('SKIM_COAT') && (
              <LayerCard
                layer={getLayer('SKIM_COAT')!}
                specLine="Surface correction only · optional"
                onToggle={() => toggleLayer('SKIM_COAT', !getLayer('SKIM_COAT')!.enabled)}
                onWasteChange={(v) => setLayerWaste('SKIM_COAT', v)}
              />
            )}
          </>
        )}

        {coreType === 'existing-wall' && (
          <>
            {getLayer('SKIM_COAT') && (
              <LayerCard
                layer={getLayer('SKIM_COAT')!}
                specLine="Surface correction only · optional"
                onToggle={() => toggleLayer('SKIM_COAT', !getLayer('SKIM_COAT')!.enabled)}
                onWasteChange={(v) => setLayerWaste('SKIM_COAT', v)}
              />
            )}
          </>
        )}
      </div>

      <div className="flex justify-between border-t border-border pt-4">
        <button
          type="button"
          onClick={prevStep}
          className="rounded-sm border border-border bg-white px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 ease-out hover:bg-surface-light"
        >
          Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-600"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
