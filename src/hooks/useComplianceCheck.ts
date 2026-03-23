// src/hooks/useComplianceCheck.ts — Evaluates parametric values against code thresholds

import { useCallback } from 'react'
import type { ParametricControl, ComplianceState } from '@/types/3d-lab'
import { useLabStore } from '@/stores/useLabStore'

export const useComplianceCheck = (controls: ParametricControl[]) => {
  const parametricValues = useLabStore((s) => s.parametricValues)
  const setComplianceState = useLabStore((s) => s.setComplianceState)

  const checkCompliance = useCallback((): ComplianceState => {
    let worstState: ComplianceState = 'compliant'

    for (const control of controls) {
      const value = parametricValues[control.id]
      if (value === undefined) continue

      const rounded = Math.round(value)

      // Check violation (below code minimum or above code maximum)
      if (control.codeMin !== undefined && rounded < control.codeMin) {
        worstState = 'violation'
        break
      }
      if (control.codeMax !== undefined && rounded > control.codeMax) {
        worstState = 'violation'
        break
      }

      // Check at-limit (exactly at code boundary)
      if (control.codeMin !== undefined && rounded === control.codeMin) {
        worstState = 'at-limit'
      }
      if (control.codeMax !== undefined && rounded === control.codeMax) {
        worstState = 'at-limit'
      }
    }

    setComplianceState(worstState)
    return worstState
  }, [controls, parametricValues, setComplianceState])

  // Check a single control's compliance state
  const checkSingleControl = useCallback(
    (controlId: string, value: number): ComplianceState => {
      const control = controls.find((c) => c.id === controlId)
      if (!control) return 'compliant'

      const rounded = Math.round(value)

      if (control.codeMin !== undefined && rounded < control.codeMin) return 'violation'
      if (control.codeMax !== undefined && rounded > control.codeMax) return 'violation'
      if (control.codeMin !== undefined && rounded === control.codeMin) return 'at-limit'
      if (control.codeMax !== undefined && rounded === control.codeMax) return 'at-limit'

      return 'compliant'
    },
    [controls]
  )

  return { checkCompliance, checkSingleControl }
}
