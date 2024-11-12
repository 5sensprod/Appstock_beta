import { useCallback, useEffect } from 'react'
import { useCanvas } from '../context/CanvasContext'
import { useGrid } from '../context/GridContext'

const useCellGrid = () => {
  const { labelConfig } = useCanvas()
  const { gridState, dispatchGridAction } = useGrid()
  const { cells, selectedCell } = gridState

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

      // Générer toutes les cellules (grille complète)
      for (let row = 0; row < labelsPerColumn; row++) {
        for (let col = 0; col < labelsPerRow; col++) {
          const cellIndex = row * labelsPerRow + col
          const cell = cells[cellIndex] || { id: cellIndex, design: {}, linkedToCsv: false } // Cellule par défaut si vide

          const label = document.createElement('div')

          // Définir la classe de style en fonction de l'état de la cellule
          let cellClass = 'absolute border cursor-pointer '
          if (cellIndex === selectedCell) {
            cellClass += 'border-blue-500' // Cellule sélectionnée (bleu)
            label.style.backgroundColor = '#cce5ff' // Bleu plus soutenu pour la sélection
          } else if (cell.design && cell.design.backgroundColor) {
            cellClass += 'border-gray-300' // Bordure grise
            label.style.backgroundColor = cell.design.backgroundColor // Appliquer le bleu très clair pour cellules liées
          } else {
            cellClass += 'border-gray-300'
            label.style.backgroundColor = cell.linkedToCsv ? '#e6f7ff' : '#f7f7f7' // Gris clair pour les cellules vides
          }
          label.className = cellClass
          console.log(`Cellule ID ${cellIndex} - Couleur de fond :`, label.style.backgroundColor)
          // Définir la taille et la position de chaque cellule dynamiquement
          label.style.width = `${(labelWidth / pageWidth) * 100}%`
          label.style.height = `${(labelHeight / pageHeight) * 100}%`
          label.style.left = `${((offsetLeft + col * (labelWidth + spacingHorizontal)) / pageWidth) * 100}%`
          label.style.top = `${((offsetTop + row * (labelHeight + spacingVertical)) / pageHeight) * 100}%`

          // Ajouter un événement de clic pour sélectionner la cellule
          label.onclick = () => {
            console.log(`Cellule cliquée : ${cellIndex}`)
            dispatchGridAction({ type: 'SELECT_CELL', payload: cellIndex })
          }

          // Ajouter chaque cellule au conteneur de la grille
          gridContainer.appendChild(label)
        }
      }

      console.log('Grille générée avec les cellules dynamiques selon labelConfig:', cells)
    }
  }, [labelConfig, cells, selectedCell, dispatchGridAction])

  useEffect(() => {
    updateGrid()
  }, [updateGrid, selectedCell]) // Ajout de `selectedCell` pour regénérer la grille à chaque changement

  return { updateGrid }
}

export default useCellGrid
