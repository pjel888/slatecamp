import { PracticeLayout } from '@/components/layouts/category/PracticeLayout'
import { DevControlsCalculator } from '../_components/DevControlsCalculator'

export const metadata = { title: 'Development Controls Calculator' }

const CalculatorPage = () => (
  <PracticeLayout
    hero={{
      subtitle: 'Development Controls Calculator',
      description:
        'Compute AMBF, TGFA, occupant load, parking, and egress.',
    }}
  >
    <DevControlsCalculator />
  </PracticeLayout>
)

export default CalculatorPage
