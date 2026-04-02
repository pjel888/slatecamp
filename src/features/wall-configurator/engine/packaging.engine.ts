export interface PackagingOutput {
  procurementQty: number
  packagingNote: string
}

export function resolvePackaging(
  adjustedQty: number,
  packageSizePerUnit: number,
  unit: string
): PackagingOutput {
  const procurementQty = Math.ceil(adjustedQty / packageSizePerUnit)
  const packagingNote = `${procurementQty} \u00d7 ${packageSizePerUnit} ${unit}`
  return { procurementQty, packagingNote }
}
