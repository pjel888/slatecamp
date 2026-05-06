type FontOptions = Record<string, unknown>

type MockFont = {
  className: string
  style: Record<string, string>
  variable?: string
}

const createMockFont = (_options?: FontOptions): MockFont => ({
  className: 'font-serif',
  style: {},
})

export const Instrument_Serif = createMockFont
export const Atkinson_Hyperlegible = createMockFont
export const Inter = createMockFont
export default createMockFont
