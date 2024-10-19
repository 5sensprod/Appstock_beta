import { useCallback, useEffect } from 'react'
import { useInstance } from '../context/InstanceContext' // Import du contexte des instances
import { useCanvas } from '../context/CanvasContext' // Import du contexte pour gérer le canvas

const useCellSelection = () => {
  const { labelConfig } = useCanvas() // Récupérer la configuration de la grille via CanvasContext
  const {
    selectedCell,
    setTotalCells,
    handleCellClick // Extraire handleCellClick du contexte
  } = useInstance() // Gérer les cellules via InstanceContext

  const updateGrid = useCallback(() => {
    const { labelWidth, labelHeight, offsetTop, offsetLeft, spacingVertical, spacingHorizontal } =
      labelConfig

    const pageWidth = 210 // A4 en mm
    const pageHeight = 297 // A4 en mm

    const availableWidth = pageWidth - offsetLeft
    const availableHeight = pageHeight - offsetTop

    const labelsPerRow = Math.floor(
      (availableWidth + spacingHorizontal) / (labelWidth + spacingHorizontal)
    )
    const labelsPerColumn = Math.floor(
      (availableHeight + spacingVertical) / (labelHeight + spacingVertical)
    )

    const totalCells = labelsPerRow * labelsPerColumn
    setTotalCells(totalCells)

    const gridContainer = document.getElementById('gridContainer')
    if (gridContainer) {
      gridContainer.innerHTML = '' // Réinitialiser la grille

      for (let row = 0; row < labelsPerColumn; row++) {
        for (let col = 0; col < labelsPerRow; col++) {
          const labelIndex = row * labelsPerRow + col
          const label = document.createElement('div')

          label.className = `absolute border ${
            selectedCell === labelIndex
              ? 'border-blue-500 bg-gray-100'
              : 'border-gray-300 bg-gray-400'
          } cursor-pointer`

          label.style.width = `${(labelWidth / pageWidth) * 100}%`
          label.style.height = `${(labelHeight / pageHeight) * 100}%`
          label.style.left = `${((offsetLeft + col * (labelWidth + spacingHorizontal)) / pageWidth) * 100}%`
          label.style.top = `${((offsetTop + row * (labelHeight + spacingVertical)) / pageHeight) * 100}%`

          label.onclick = () => handleCellClick(labelIndex) // Utiliser handleCellClick du contexte

          gridContainer.appendChild(label)
        }
      }
    }
  }, [labelConfig, selectedCell, setTotalCells, handleCellClick])

  useEffect(() => {
    updateGrid()
  }, [updateGrid])

  return { updateGrid, selectedCell }
}

export default useCellSelection