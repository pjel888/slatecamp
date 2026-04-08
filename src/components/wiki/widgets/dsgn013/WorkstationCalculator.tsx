'use client'

import { useState } from 'react'

const DENSITY_OPTIONS = [
  { value: 9.3, label: 'LEA standard (9.30 sq m)' },
  { value: 5.0, label: 'Philippine practice (5.00 sq m)' },
  { value: 14.0, label: 'International standard (14.00 sq m)' },
]

const MULTIPLIER_OPTIONS = [
  { value: 1.25, label: '1.25 (efficient layout)' },
  { value: 1.3, label: '1.30 (standard)' },
  { value: 1.35, label: '1.35 (generous)' },
]

export const WorkstationCalculator = () => {
  const [employees, setEmployees] = useState(50)
  const [density, setDensity] = useState(9.3)
  const [multiplier, setMultiplier] = useState(1.3)
  const [floors, setFloors] = useState(1)

  const nfa = employees * density
  const gfa = Math.round(nfa * multiplier)
  const perFloor = Math.round(gfa / Math.max(floors, 1))

  return (
    <div className="not-prose my-5 rounded-md border border-border overflow-hidden bg-card dark:bg-card">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-gradient-to-br from-cobalt-light to-[var(--wiki-gradient-blue)] border-b border-wiki-border dark:from-camp-cobalt/10 dark:to-camp-cobalt/5 dark:border-wiki-invert-divider">
        <div className="w-7 h-7 rounded-lg bg-camp-cobalt flex items-center justify-center text-white text-sm">
          🧮
        </div>
        <div>
          <div className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.1em] text-camp-cobalt">
            Interactive Calculator
          </div>
          <div className="text-[13px] text-wiki-body mt-0.5 dark:text-wiki-invert-body">
            Office Floor Area from Employee Count
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {/* Employees */}
          <div>
            <label className="block font-[var(--font-dm-mono)] text-[11px] uppercase tracking-[0.08em] text-ink-muted mb-1">
              Number of employees
            </label>
            <input
              type="number"
              value={employees}
              min={1}
              max={1000}
              onChange={(e) => setEmployees(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border-[1.5px] border-wiki-border rounded-lg font-sans text-sm text-wiki-ink bg-white outline-none transition-colors duration-150 focus:border-camp-cobalt dark:bg-wiki-surface-dark dark:border-wiki-invert-divider dark:text-wiki-invert-heading"
            />
          </div>

          {/* Density */}
          <div>
            <label className="block font-[var(--font-dm-mono)] text-[11px] uppercase tracking-[0.08em] text-ink-muted mb-1">
              Density standard
            </label>
            <select
              value={density}
              onChange={(e) => setDensity(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border-[1.5px] border-wiki-border rounded-lg font-sans text-sm text-wiki-ink bg-white outline-none transition-colors duration-150 focus:border-camp-cobalt dark:bg-wiki-surface-dark dark:border-wiki-invert-divider dark:text-wiki-invert-heading"
            >
              {DENSITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Multiplier */}
          <div>
            <label className="block font-[var(--font-dm-mono)] text-[11px] uppercase tracking-[0.08em] text-ink-muted mb-1">
              Net-to-gross multiplier
            </label>
            <select
              value={multiplier}
              onChange={(e) => setMultiplier(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border-[1.5px] border-wiki-border rounded-lg font-sans text-sm text-wiki-ink bg-white outline-none transition-colors duration-150 focus:border-camp-cobalt dark:bg-wiki-surface-dark dark:border-wiki-invert-divider dark:text-wiki-invert-heading"
            >
              {MULTIPLIER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Floors */}
          <div>
            <label className="block font-[var(--font-dm-mono)] text-[11px] uppercase tracking-[0.08em] text-ink-muted mb-1">
              Floors available
            </label>
            <input
              type="number"
              value={floors}
              min={1}
              max={50}
              onChange={(e) => setFloors(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border-[1.5px] border-wiki-border rounded-lg font-sans text-sm text-wiki-ink bg-white outline-none transition-colors duration-150 focus:border-camp-cobalt dark:bg-wiki-surface-dark dark:border-wiki-invert-divider dark:text-wiki-invert-heading"
            />
          </div>
        </div>

        {/* Result */}
        <div className="p-4 bg-muted rounded-md mt-3 dark:bg-wiki-surface-dark">
          <div className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-camp-cobalt mb-1.5">
            Required Gross Floor Area
          </div>
          <div>
            <span className="font-[var(--font-dm-mono)] text-2xl font-medium text-camp-cobalt">
              {gfa.toLocaleString()}
            </span>
            <span className="text-sm text-ink-muted ml-1">sq m</span>
          </div>
          <div className="text-xs text-ink-muted mt-2 leading-relaxed dark:text-wiki-muted">
            NFA = {employees} × {density.toFixed(2)} = {Math.round(nfa)} sq m · GFA = {Math.round(nfa)} × {multiplier.toFixed(2)} = {gfa} sq m · Per floor: {perFloor.toLocaleString()} sq m
          </div>
        </div>
      </div>
    </div>
  )
}
