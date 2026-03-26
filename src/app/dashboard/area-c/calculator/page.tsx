import { DevControlsCalculator } from '../_components/DevControlsCalculator'

export const metadata = { title: 'Development Controls Calculator' }

const CalculatorPage = () => (
  <div className='max-w-4xl mx-auto px-4 py-6 w-full'>
    <div className='mb-6'>
      <h1 className='text-xl font-semibold' style={{ color: '#1A2332' }}>
        Development Controls Calculator
      </h1>
      <p className='mt-1 text-sm' style={{ color: '#4A5568' }}>
        Compute AMBF, TGFA, occupant load, parking, and egress requirements
        under PD 1096, BP 344, and RA 9514.
      </p>
    </div>
    <DevControlsCalculator />
  </div>
)

export default CalculatorPage
