'use client'

import { useDrywallStore } from '@/app/calculators/_stores/drywallStore'
import {
  CheckboxField,
  FieldLabel,
  NumberInput,
  PresetButton,
  SectionLabel,
  Separator,
  ToggleButton,
} from '@/components/calculators/InputPrimitives'

// ─── Helpers ─────────────────────────────────────────────────────────────────


// ─── DrywallInputPanel ───────────────────────────────────────────────────────

export function DrywallInputPanel() {
  const wallLengthMm = useDrywallStore((s) => s.wallLengthMm)
  const wallHeightMm = useDrywallStore((s) => s.wallHeightMm)
  const studSpacingMm = useDrywallStore((s) => s.studSpacingMm)
  const includeCornerStudAllowance = useDrywallStore((s) => s.includeCornerStudAllowance)
  const cornerStudExtraCount = useDrywallStore((s) => s.cornerStudExtraCount)
  const includeOpeningFramingAllowance = useDrywallStore((s) => s.includeOpeningFramingAllowance)
  const extraStudsPerOpening = useDrywallStore((s) => s.extraStudsPerOpening)
  const boardLengthMm = useDrywallStore((s) => s.boardLengthMm)
  const boardWidthMm = useDrywallStore((s) => s.boardWidthMm)
  const boardOrientation = useDrywallStore((s) => s.boardOrientation)
  const boardLayersPerSide = useDrywallStore((s) => s.boardLayersPerSide)
  const sidesBoarded = useDrywallStore((s) => s.sidesBoarded)
  const wastePercent = useDrywallStore((s) => s.wastePercent)
  const trackStockLengthMm = useDrywallStore((s) => s.trackStockLengthMm)
  const drywallViewMode = useDrywallStore((s) => s.drywallViewMode)
  const setInput = useDrywallStore((s) => s.setInput)
  const toggleDrywallView = useDrywallStore((s) => s.toggleDrywallView)

  const BOARD_PRESETS = [
    { label: 'Hardiflex 4mm', lengthMm: 2440, widthMm: 1220 },
    { label: 'Hardiflex 6mm', lengthMm: 2440, widthMm: 1220 },
    { label: 'Gypsum 9.5mm', lengthMm: 2440, widthMm: 1220 },
    { label: 'Gypsum 12.5mm', lengthMm: 2440, widthMm: 1220 },
    { label: 'Gypsum 12.5mm (tall)', lengthMm: 2740, widthMm: 1220 },
  ]

  const isStandardBoardSize = BOARD_PRESETS.some(
    (p) => p.lengthMm === boardLengthMm && p.widthMm === boardWidthMm,
  )

  const isStandardSpacing = studSpacingMm === 400 || studSpacingMm === 600

  return (
    <div className="space-y-3">
      {/* ── Wall Dimensions ────────────────────────────────────────────────── */}
      <SectionLabel>Wall Dimensions</SectionLabel>

      <div>
        <FieldLabel>Wall length (mm)</FieldLabel>
        <NumberInput
          value={wallLengthMm}
          onChange={(v) => setInput('wallLengthMm', v)}
        />
      </div>

      <div>
        <FieldLabel>Wall height (mm)</FieldLabel>
        <NumberInput
          value={wallHeightMm}
          onChange={(v) => setInput('wallHeightMm', v)}
        />
      </div>

      {/* ── Framing ────────────────────────────────────────────────────────── */}
      <Separator />
      <SectionLabel>Framing</SectionLabel>

      <div>
        <FieldLabel>Stud spacing</FieldLabel>
        <div className="mt-1 flex gap-1.5">
          <PresetButton
            label="400mm"
            active={studSpacingMm === 400}
            onClick={() => setInput('studSpacingMm', 400)}
          />
          <PresetButton
            label="600mm"
            active={studSpacingMm === 600}
            onClick={() => setInput('studSpacingMm', 600)}
          />
        </div>
        {!isStandardSpacing && (
          <NumberInput
            value={studSpacingMm}
            onChange={(v) => setInput('studSpacingMm', v)}
            min={100}
          />
        )}
      </div>

      <CheckboxField
        label="Corner stud allowance"
        checked={includeCornerStudAllowance}
        onChange={(value) => setInput('includeCornerStudAllowance', value)}
      />
      {includeCornerStudAllowance && (
        <div>
          <FieldLabel>Extra corner studs</FieldLabel>
          <NumberInput
            value={cornerStudExtraCount}
            onChange={(v) => setInput('cornerStudExtraCount', v)}
            min={0}
          />
        </div>
      )}

      <CheckboxField
        label="Opening framing allowance"
        checked={includeOpeningFramingAllowance}
        onChange={(value) => setInput('includeOpeningFramingAllowance', value)}
      />
      {includeOpeningFramingAllowance && (
        <div>
          <FieldLabel>Extra studs per opening</FieldLabel>
          <NumberInput
            value={extraStudsPerOpening}
            onChange={(v) => setInput('extraStudsPerOpening', v)}
            min={0}
          />
        </div>
      )}

      {/* ── Board Configuration ────────────────────────────────────────────── */}
      <Separator />
      <SectionLabel>Board Configuration</SectionLabel>

      <div>
        <FieldLabel>Board size</FieldLabel>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {BOARD_PRESETS.map((preset) => (
            <PresetButton
              key={preset.label}
              label={preset.label}
              active={boardLengthMm === preset.lengthMm && boardWidthMm === preset.widthMm}
              onClick={() => {
                setInput('boardLengthMm', preset.lengthMm)
                setInput('boardWidthMm', preset.widthMm)
              }}
            />
          ))}
        </div>
        {!isStandardBoardSize && (
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <div>
              <FieldLabel>Length (mm)</FieldLabel>
              <NumberInput
                value={boardLengthMm}
                onChange={(v) => setInput('boardLengthMm', v)}
                min={100}
              />
            </div>
            <div>
              <FieldLabel>Width (mm)</FieldLabel>
              <NumberInput
                value={boardWidthMm}
                onChange={(v) => setInput('boardWidthMm', v)}
                min={100}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <FieldLabel>Orientation</FieldLabel>
        <div className="mt-1 flex gap-1.5">
          <ToggleButton
            label="Vertical"
            active={boardOrientation === 'vertical'}
            onClick={() => setInput('boardOrientation', 'vertical')}
            className="flex-1"
          />
          <ToggleButton
            label="Horizontal"
            active={boardOrientation === 'horizontal'}
            onClick={() => setInput('boardOrientation', 'horizontal')}
            className="flex-1"
          />
        </div>
      </div>

      <div>
        <FieldLabel>Layers per side</FieldLabel>
        <div className="mt-1 flex gap-1.5">
          <PresetButton
            label="1"
            active={boardLayersPerSide === 1}
            onClick={() => setInput('boardLayersPerSide', 1)}
          />
          <PresetButton
            label="2"
            active={boardLayersPerSide === 2}
            onClick={() => setInput('boardLayersPerSide', 2)}
          />
        </div>
      </div>

      <div>
        <FieldLabel>Sides boarded</FieldLabel>
        <div className="mt-1 flex gap-1.5">
          <ToggleButton
            label="One side"
            active={sidesBoarded === 'one-side'}
            onClick={() => setInput('sidesBoarded', 'one-side')}
            className="flex-1"
          />
          <ToggleButton
            label="Two sides"
            active={sidesBoarded === 'two-side'}
            onClick={() => setInput('sidesBoarded', 'two-side')}
            className="flex-1"
          />
        </div>
      </div>

      {/* ── Other ──────────────────────────────────────────────────────────── */}
      <Separator />
      <SectionLabel>Other</SectionLabel>

      <div>
        <FieldLabel>Waste %</FieldLabel>
        <NumberInput
          value={wastePercent}
          onChange={(v) => setInput('wastePercent', v)}
          min={0}
        />
      </div>

      <div>
        <FieldLabel>Track stock length (mm)</FieldLabel>
        <NumberInput
          value={trackStockLengthMm}
          onChange={(v) => setInput('trackStockLengthMm', v)}
          min={100}
        />
      </div>

      {/* ── View Toggle ────────────────────────────────────────────────────── */}
      <Separator />
      <div className="flex gap-1.5">
        <ToggleButton
          label="Frame"
          active={drywallViewMode === 'frame'}
          onClick={toggleDrywallView}
          className="flex-1"
        />
        <ToggleButton
          label="Boarded"
          active={drywallViewMode === 'boarded'}
          onClick={toggleDrywallView}
          className="flex-1"
        />
      </div>
    </div>
  )
}
