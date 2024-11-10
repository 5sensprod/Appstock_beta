// frontend/hooks/useCellGrid.js

import { useCallback, useEffect } from 'react'
import { useCanvas } from '../context/CanvasContext'

const useCellGrid = () => {
  const { labelConfig } = useCanvas()

  const updateGrid = useCallback(() => {
    const { labelWidth, labelHeight, offsetTop, offsetLeft, spacingVertical, spacingHorizontal } =
      labelConfig

    const pageWidth = 210 // Largeur de la page A4 en mm
    const pageHeight = 297 // Hauteur de la page A4 en mm

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
          console.log(`Index de la cellule : ${labelIndex}`) // Utilisation temporaire

          const label = document.createElement('div')

          // Appliquer les styles par défaut pour chaque cellule
          label.className = 'absolute border border-gray-300 bg-gray-100 cursor-pointer'

          // Définir la taille et la position de chaque cellule
          label.style.width = `${(labelWidth / pageWidth) * 100}%`
          label.style.height = `${(labelHeight / pageHeight) * 100}%`
          label.style.left = `${((offsetLeft + col * (labelWidth + spacingHorizontal)) / pageWidth) * 100}%`
          label.style.top = `${((offsetTop + row * (labelHeight + spacingVertical)) / pageHeight) * 100}%`

          // Ajouter chaque cellule au conteneur de la grille
          gridContainer.appendChild(label)
        }
      }
    }
  }, [labelConfig])

  useEffect(() => {
    updateGrid()
  }, [updateGrid])

  return { updateGrid }
}

export default useCellGrid
