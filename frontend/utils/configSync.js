export function syncGridConfigToLabelConfig(gridConfig) {
  console.log('syncGridConfigToLabelConfig called')
  console.log('GridConfig received:', gridConfig)

  const labelConfig = {
    labelWidth: gridConfig.cellWidth,
    labelHeight: gridConfig.cellHeight,
    offsetTop: gridConfig.offsetTop,
    offsetLeft: gridConfig.offsetLeft,
    spacingVertical: gridConfig.spacingVertical,
    spacingHorizontal: gridConfig.spacingHorizontal,
    pageWidth: gridConfig.pageWidth,
    pageHeight: gridConfig.pageHeight,
    backgroundColor: gridConfig.backgroundColor || 'white' // Si un jour une couleur est ajoutée
  }

  console.log('Generated LabelConfig:', labelConfig)
  return labelConfig
}
