import { useCallback, useEffect } from 'react'
import { useCanvas } from '../../context/CanvasContext'

const useGridGenerator = (selectCell) => {
  const { labelConfig, selectedCellIndex, cellObjects } = useCanvas() // Ajout de cellObjects

  const generateGrid = useCallback(() => {
    const { labelWidth, labelHeight, offsetTop, offsetLeft, spacingVertical, spacingHorizontal } =
      labelConfig

    const pageWidth = 210
    const pageHeight = 297

    const availableWidth = pageWidth - offsetLeft
    const availableHeight = pageHeight - offsetTop

    const labelsPerRow = Math.floor(
      (availableWidth + spacingHorizontal) / (labelWidth + spacingHorizontal)
    )
    const labelsPerColumn = Math.floor(
      (availableHeight + spacingVertical) / (labelHeight + spacingVertical)
    )

    const gridContainer = document.getElementById('gridContainer')
    if (gridContainer) {
      gridContainer.innerHTML = ''

      for (let row = 0; row < labelsPerColumn; row++) {
        for (let col = 0; col < labelsPerRow; col++) {
          const labelIndex = row * labelsPerRow + col
          const label = document.createElement('div')

          // Applique le style bleu clair si la cellule contient des objets
          const hasContent = cellObjects[labelIndex] && cellObjects[labelIndex].length > 0
          label.className = `absolute border ${
            labelIndex === selectedCellIndex
              ? 'border-blue-500 bg-blue-100'
              : hasContent
                ? 'border-gray-300 bg-blue-50' // Fond bleu clair pour les cellules avec contenu
                : 'border-gray-300 bg-gray-100'
          } cursor-pointer`

          label.style.width = `${(labelWidth / pageWidth) * 100}%`
          label.style.height = `${(labelHeight / pageHeight) * 100}%`
          label.style.left = `${((offsetLeft + col * (labelWidth + spacingHorizontal)) / pageWidth) * 100}%`
          label.style.top = `${((offsetTop + row * (labelHeight + spacingVertical)) / pageHeight) * 100}%`

          label.onclick = () => selectCell(labelIndex)

          gridContainer.appendChild(label)
        }
      }
    }
  }, [labelConfig, selectedCellIndex, cellObjects, selectCell])

  useEffect(() => {
    generateGrid()
  }, [generateGrid])

  return { generateGrid }
}

export default useGridGenerator
