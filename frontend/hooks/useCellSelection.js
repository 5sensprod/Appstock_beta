import { useCallback, useEffect } from 'react'
import { useInstance } from '../context/InstanceContext' // Import du contexte des instances
import { useCanvas } from '../context/CanvasContext' // Import du contexte pour gérer le canvas

const useCellSelection = () => {
  const { labelConfig } = useCanvas() // Récupérer la configuration de la grille via CanvasContext
  const { selectedCells, setTotalCells, handleCellClick, cellDesigns } = useInstance()

  // Fonction de mise à jour de la grille
  const updateGrid = useCallback(() => {
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

    const totalCells = labelsPerRow * labelsPerColumn
    setTotalCells(totalCells)

    const gridContainer = document.getElementById('gridContainer')
    console.log('Grid container trouvé')
    if (gridContainer) {
      gridContainer.innerHTML = '' // Réinitialiser la grille

      for (let row = 0; row < labelsPerColumn; row++) {
        for (let col = 0; col < labelsPerRow; col++) {
          const labelIndex = row * labelsPerRow + col
          const label = document.createElement('div')

          const hasDesign = Boolean(cellDesigns[labelIndex])

          // Vérifier si la cellule fait partie de selectedCells (sélection multiple)
          label.className = `absolute border ${
            selectedCells.includes(labelIndex)
              ? 'border-blue-500 bg-blue-500' // Cellules sélectionnées en bleu
              : hasDesign
                ? 'border-blue-300 bg-blue-200' // Cellule avec contenu en bleu clair
                : 'border-gray-300 bg-gray-400' // Cellule vide
          } cursor-pointer`

          label.style.width = `${(labelWidth / pageWidth) * 100}%`
          label.style.height = `${(labelHeight / pageHeight) * 100}%`
          label.style.left = `${((offsetLeft + col * (labelWidth + spacingHorizontal)) / pageWidth) * 100}%`
          label.style.top = `${((offsetTop + row * (labelHeight + spacingVertical)) / pageHeight) * 100}%`

          // Passer l'événement du clic pour permettre la sélection multiple
          label.onclick = (event) => handleCellClick(labelIndex, event)

          gridContainer.appendChild(label)
        }
      }
    }
  }, [labelConfig, selectedCells, setTotalCells, handleCellClick, cellDesigns])

  // Mettre à jour la grille chaque fois que les designs ou la sélection multiple changent
  useEffect(() => {
    if (cellDesigns.length > 0) {
      console.log('Cell Designs:', cellDesigns)
    }
    console.log('Selected Cells:', selectedCells) // Afficher le tableau des cellules sélectionnées
    updateGrid() // Recréer la grille à chaque changement
  }, [updateGrid, cellDesigns, selectedCells])

  useEffect(() => {
    updateGrid()
  }, [updateGrid])

  return { updateGrid, selectedCells }
}

export default useCellSelection
