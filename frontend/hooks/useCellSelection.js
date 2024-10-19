import { useCallback, useEffect } from 'react'
import { useInstance } from '../context/InstanceContext' // Import du contexte des instances
import { useCanvas } from '../context/CanvasContext' // Import du contexte pour gérer le canvas

const useCellSelection = () => {
  const { labelConfig } = useCanvas() // Récupérer la configuration de la grille via CanvasContext
  const {
    selectedCell,
    setTotalCells,
    handleCellClick,
    cellDesigns // Récupérer les designs des cellules du contexte
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
    console.log('Grid container trouvé')
    if (gridContainer) {
      gridContainer.innerHTML = '' // Réinitialiser la grille

      for (let row = 0; row < labelsPerColumn; row++) {
        for (let col = 0; col < labelsPerRow; col++) {
          const labelIndex = row * labelsPerRow + col
          const label = document.createElement('div')

          // Vérifier si la cellule contient un design valide (non vide)
          const hasDesign = Boolean(cellDesigns[labelIndex])

          // Appliquer un fond gris très clair si la cellule a un design valide
          label.className = `absolute border ${
            selectedCell === labelIndex
              ? 'border-blue-500 bg-blue-500' // Cellule sélectionnée en bleu
              : hasDesign
                ? 'border-blue-300 bg-blue-200' // Cellule avec contenu en bleu clair
                : 'border-gray-300 bg-gray-400' // Cellule vide
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
  }, [labelConfig, selectedCell, setTotalCells, handleCellClick, cellDesigns])

  // Mettre à jour la grille chaque fois que les designs ou la cellule sélectionnée changent
  useEffect(() => {
    if (cellDesigns.length > 0) {
      console.log('Cell Designs:', cellDesigns)
    }
    console.log('Selected Cell:', selectedCell)
    updateGrid()
  }, [updateGrid, cellDesigns, selectedCell])

  return { updateGrid, selectedCell }
}

export default useCellSelection
