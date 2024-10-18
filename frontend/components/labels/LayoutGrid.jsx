import React, { useEffect, useCallback } from 'react'
import { useCanvas } from '../../context/CanvasContext' // Import du contexte

const LayoutGrid = () => {
  const { labelConfig, selectedCell, setSelectedCell, saveCellDesign, setTotalCells } = useCanvas() // Ajout de setTotalCells

  const updateGrid = useCallback(() => {
    const { labelWidth, labelHeight, offsetTop, offsetLeft, spacingVertical, spacingHorizontal } =
      labelConfig

    const pageWidth = 210 // A4 en mm
    const pageHeight = 297 // A4 en mm

    const availableWidth = pageWidth - offsetLeft
    const availableHeight = pageHeight - offsetTop

    // Calcul du nombre d'étiquettes par ligne et colonne
    const labelsPerRow = Math.floor(
      (availableWidth + spacingHorizontal) / (labelWidth + spacingHorizontal)
    )
    const labelsPerColumn = Math.floor(
      (availableHeight + spacingVertical) / (labelHeight + spacingVertical)
    )

    // Calcul du nombre total de cellules
    const totalCells = labelsPerRow * labelsPerColumn

    // Transmettre le nombre total de cellules au contexte
    setTotalCells(totalCells)

    const gridContainer = document.getElementById('gridContainer')
    if (gridContainer) {
      gridContainer.innerHTML = ''

      for (let row = 0; row < labelsPerColumn; row++) {
        for (let col = 0; col < labelsPerRow; col++) {
          const labelIndex = row * labelsPerRow + col // Calcul de l'index de la cellule
          const label = document.createElement('div')
          label.className = `absolute border ${
            selectedCell === labelIndex ? 'border-blue-500' : 'border-gray-300'
          } bg-gray-400 cursor-pointer`
          label.style.width = `${(labelWidth / pageWidth) * 100}%`
          label.style.height = `${(labelHeight / pageHeight) * 100}%`
          label.style.left = `${((offsetLeft + col * (labelWidth + spacingHorizontal)) / pageWidth) * 100}%`
          label.style.top = `${((offsetTop + row * (labelHeight + spacingVertical)) / pageHeight) * 100}%`

          label.onclick = () => {
            saveCellDesign() // Sauvegarde le design actuel avant de changer de cellule
            setSelectedCell(labelIndex) // Change la cellule sélectionnée
          }

          gridContainer.appendChild(label)
        }
      }
    }
  }, [labelConfig, selectedCell, setSelectedCell, saveCellDesign, setTotalCells])

  useEffect(() => {
    updateGrid()
  }, [updateGrid])

  return (
    <div className="relative w-full border-2 border-gray-300 bg-light-background pb-[141.4%] shadow-xl dark:bg-dark-background">
      <div id="gridContainer" className="absolute left-0 top-0 size-full"></div>
    </div>
  )
}

export default LayoutGrid
