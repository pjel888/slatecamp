import type { Metadata } from 'next'
import { CalculatorToolShell } from '@/components/calculators/CalculatorToolShell'
import { CALCULATOR_TOOL_META } from '@/components/calculators/calculator-tool-registry'

export const metadata: Metadata = CALCULATOR_TOOL_META.chb

export default function CHBCalculatorPage() {
  return <CalculatorToolShell tool="chb" />
}
