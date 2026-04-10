export interface BhlControlDisplayInput {
  currentBhlStoreys: number
  computedBhlStoreys: number
  floorHeight: number
  isCustom: boolean
}

export interface BhlControlDisplay {
  label: string
  value: number
  formattedValue: string
  contextLine: string
  isViolating: boolean
  resetLabel: string
}

export const buildBhlControlDisplay = ({
  currentBhlStoreys,
  computedBhlStoreys,
  floorHeight,
  isCustom,
}: BhlControlDisplayInput): BhlControlDisplay => ({
  label: `BHL ${isCustom ? '' : '(Computed)'}`,
  value: currentBhlStoreys,
  formattedValue: `${currentBhlStoreys}F / ${(currentBhlStoreys * floorHeight).toFixed(1)}m`,
  contextLine: `Computed: ${computedBhlStoreys}F`,
  isViolating: isCustom,
  resetLabel: `Reset to computed (${computedBhlStoreys}F)`,
})
