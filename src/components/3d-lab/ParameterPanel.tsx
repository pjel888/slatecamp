'use client'

import { useEffect, useRef } from 'react'
import type { ParametricControl } from '@/types/3d-lab'
import { useLabStore } from '@/stores/useLabStore'
import { useComplianceCheck } from '@/hooks/useComplianceCheck'
import { ParametricSlider } from './ParametricSlider'
import { ComplianceStatus } from './ComplianceStatus'

interface ParameterPanelProps {
  title: string
  codeReference: string
  controls: ParametricControl[]
}

export const ParameterPanel = ({
  title,
  codeReference,
  controls,
}: ParameterPanelProps) => {
  const parametricValues = useLabStore((s) => s.parametricValues)
  const setParametricValue = useLabStore((s) => s.setParametricValue)
  const complianceState = useLabStore((s) => s.complianceState)
  const { checkCompliance, checkSingleControl } = useComplianceCheck(controls)

  // Initialize default values on mount for any control not yet in store
  const didInit = useRef(false)
  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    for (const control of controls) {
      if (parametricValues[control.id] === undefined) {
        setParametricValue(control.id, control.defaultValue)
      }
    }
  }, [controls, parametricValues, setParametricValue])

  // Re-check compliance whenever values change
  useEffect(() => {
    checkCompliance()
  }, [checkCompliance])

  const handleChange = (controlId: string, value: number) => {
    setParametricValue(controlId, value)
  }

  return (
    <>
      {/* Desktop: fixed left drawer */}
      <aside
        role="complementary"
        aria-label="Parameter controls"
        className="max-sm:hidden"
        style={{
          position: 'fixed',
          left: 0,
          top: '36px',
          height: 'calc(100vh - 36px)',
          width: '240px',
          backgroundColor: '#ffffff',
          borderRight: '0.5px solid #D4DAE3',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
          // Slide-in from left
          animation: 'paramPanelSlideIn 200ms ease-out both',
        }}
      >
        <PanelContent
          title={title}
          codeReference={codeReference}
          controls={controls}
          parametricValues={parametricValues}
          complianceState={complianceState}
          onChangeValue={handleChange}
          checkSingleControl={checkSingleControl}
        />
      </aside>

      {/* Mobile: bottom drawer, max-h-[50vh] */}
      <aside
        role="complementary"
        aria-label="Parameter controls"
        className="sm:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '50vh',
          backgroundColor: '#ffffff',
          borderTop: '0.5px solid #D4DAE3',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
          overflowY: 'auto',
          animation: 'paramPanelSlideUp 200ms ease-out both',
        }}
      >
        <PanelContent
          title={title}
          codeReference={codeReference}
          controls={controls}
          parametricValues={parametricValues}
          complianceState={complianceState}
          onChangeValue={handleChange}
          checkSingleControl={checkSingleControl}
        />
      </aside>

      {/* Keyframe styles injected once */}
      <style>{`
        @keyframes paramPanelSlideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes paramPanelSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Internal content shared between desktop and mobile layouts          */
/* ------------------------------------------------------------------ */

interface PanelContentProps {
  title: string
  codeReference: string
  controls: ParametricControl[]
  parametricValues: Record<string, number>
  complianceState: ReturnType<typeof useLabStore.getState>['complianceState']
  onChangeValue: (controlId: string, value: number) => void
  checkSingleControl: (controlId: string, value: number) => ReturnType<typeof useLabStore.getState>['complianceState']
}

const PanelContent = ({
  title,
  codeReference,
  controls,
  parametricValues,
  complianceState,
  onChangeValue,
  checkSingleControl,
}: PanelContentProps) => (
  <>
    {/* Header */}
    <div
      style={{
        padding: '12px 16px 11px',
        borderBottom: '0.5px solid #D4DAE3',
        flexShrink: 0,
      }}
    >
      <p
        style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '9px',
          fontWeight: 500,
          color: '#8896A7',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin: '0 0 4px',
        }}
      >
        {codeReference}
      </p>
      <h2
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '13px',
          fontWeight: 600,
          color: '#1A2332',
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        {title}
      </h2>
    </div>

    {/* Slider body */}
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {controls.map((control) => {
        const currentValue = parametricValues[control.id] ?? control.defaultValue
        const singleState = checkSingleControl(control.id, currentValue)
        return (
          <ParametricSlider
            key={control.id}
            control={control}
            value={currentValue}
            onChange={(v) => onChangeValue(control.id, v)}
            complianceState={singleState}
          />
        )
      })}
    </div>

    {/* Compliance status pinned at bottom */}
    <div
      style={{
        padding: '0 16px 16px',
        flexShrink: 0,
      }}
    >
      <ComplianceStatus state={complianceState} codeReference={codeReference} />
    </div>
  </>
)
