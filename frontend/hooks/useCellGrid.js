// frontend/hooks/useCellGrid.js

import { useCallback, useEffect } from 'react'
import { useInstance } from '../context/InstanceContext'
import { useCanvas } from '../context/CanvasContext'

const useCellGrid = () => {
  const { labelConfig } = useCanvas()
  const { selectedCells, handleCellClick, instanceState } = useInstance()

  const updateGrid = useCallback(() => {
    const { labelWidth, labelHeight, offsetTop, offsetLeft, spacingVertical, spacingHorizontal } =
      labelConfig

    const pageWidth = 210 // largeur de la page A4 en mm
    const pageHeight = 297 // hauteur de la page A4 en mm

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
      gridContainer.innerHTML = '' // Nettoyer la grille existante

      for (let row = 0; row < labelsPerColumn; row++) {
        for (let col = 0; col < labelsPerRow; col++) {
          const labelIndex = row * labelsPerRow + col
          const label = document.createElement('div')

          // Vérifier si la cellule a un design ou est liée
          const hasDesign = Boolean(instanceState.objects[labelIndex])
          const isLinkedCell = Object.keys(instanceState.linkedCells).some(
            (primaryCell) =>
              parseInt(primaryCell) === labelIndex ||
              instanceState.linkedCells[primaryCell].includes(labelIndex)
          )

          // Appliquer les classes de style selon l'état de la cellule
          label.className = `absolute border ${
            selectedCells.includes(labelIndex) && isLinkedCell
              ? 'border-red-500 bg-red-500'
              : selectedCells.includes(labelIndex)
                ? 'border-blue-500 bg-blue-500'
                : isLinkedCell
                  ? 'border-red-100 bg-red-200'
                  : hasDesign
                    ? 'border-blue-300 bg-blue-200'
                    : 'border-gray-300 bg-gray-100'
          } cursor-pointer`

          // Appliquer la taille et la position de chaque cellule
          label.style.width = `${(labelWidth / pageWidth) * 100}%`
          label.style.height = `${(labelHeight / pageHeight) * 100}%`
          label.style.left = `${((offsetLeft + col * (labelWidth + spacingHorizontal)) / pageWidth) * 100}%`
          label.style.top = `${((offsetTop + row * (labelHeight + spacingVertical)) / pageHeight) * 100}%`

          // Ajouter un événement de clic pour gérer la sélection
          label.onclick = (event) => handleCellClick(labelIndex, event)

          gridContainer.appendChild(label)
        }
      }
    }
  }, [
    labelConfig,
    selectedCells,
    handleCellClick,
    instanceState.objects,
    instanceState.linkedCells
  ])

  useEffect(() => {
    updateGrid()
  }, [updateGrid, instanceState.objects, selectedCells, instanceState.linkedCells])

  return { updateGrid, selectedCells }
}

export default useCellGrid
