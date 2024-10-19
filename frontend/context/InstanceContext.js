import React, { createContext, useState, useContext, useCallback } from 'react'
import { useCanvas } from './CanvasContext' // Importer useCanvas

const InstanceContext = createContext()

export const useInstance = () => useContext(InstanceContext)

const InstanceProvider = ({ children }) => {
  const { canvas } = useCanvas() // Utiliser useCanvas pour accéder au canevas
  const [selectedCell, setSelectedCell] = useState(0) // Cellule sélectionnée par défaut
  const [cellDesigns, setCellDesigns] = useState({})
  const [totalCells, setTotalCells] = useState(0) // Nombre total de cellules
  const [copiedDesign, setCopiedDesign] = useState(null)
  const [selectedCells, setSelectedCells] = useState([]) // Gestion des cellules sélectionnées

  // Sauvegarde du design actuel dans la cellule sélectionnée
  const saveDesignForSelectedCell = () => {
    if (canvas) {
      const currentDesign = JSON.stringify(canvas)
      setCellDesigns((prevDesigns) => ({
        ...prevDesigns,
        [selectedCell]: currentDesign
      }))
    }
  }

  // Fonction pour charger le design de la cellule sélectionnée
  const loadCellDesign = useCallback(
    (cellIndex) => {
      if (canvas) {
        if (cellDesigns[cellIndex]) {
          canvas.clear()
          canvas.loadFromJSON(cellDesigns[cellIndex], () => {
            setTimeout(() => {
              canvas.renderAll() // Forcer le rendu après un léger délai
            }, 10)
          })
        } else {
          canvas.clear()
          canvas.renderAll() // Forcer le rendu même si la cellule est vide
        }
      }
    },
    [canvas, cellDesigns]
  )

  const handleCellClick = (labelIndex) => {
    saveDesignForSelectedCell()
    setSelectedCell(labelIndex)
    loadCellDesign(labelIndex)
  }

  // Fonction pour copier le design actuel du canvas
  const copyDesign = () => {
    if (canvas && typeof canvas.toJSON === 'function') {
      const currentDesign = JSON.stringify(canvas.toJSON()) // Copier le design du canvas
      setCopiedDesign(currentDesign)
      console.log('Design copié :', currentDesign)
    } else {
      console.log('Canvas non valide ou toJSON indisponible.')
    }
  }

  // Fonction pour coller le design dans les cellules sélectionnées
  const pasteDesign = (selectedCells, isInstance = false) => {
    if (!canvas || !copiedDesign) {
      console.log('Aucun design à coller ou canvas non disponible.')
      return
    }

    console.log('Cellules sélectionnées avant collage :', selectedCells) // Vérification
    console.log('Design copié :', copiedDesign)

    selectedCells.forEach((cellIndex) => {
      if (isInstance) {
        const instanceDesign = JSON.stringify({
          ...JSON.parse(copiedDesign),
          parentCell: selectedCell // Assurer que cette logique est correcte
        })
        setCellDesigns((prevDesigns) => ({
          ...prevDesigns,
          [cellIndex]: instanceDesign
        }))
      } else {
        setCellDesigns((prevDesigns) => ({
          ...prevDesigns,
          [cellIndex]: copiedDesign
        }))
      }
    })

    loadCellDesign(selectedCells[0]) // Charger le design dans la première cellule sélectionnée
  }

  const value = {
    selectedCell,
    setSelectedCell,
    handleCellClick,
    selectedCells,
    setSelectedCells,
    cellDesigns,
    saveDesignForSelectedCell,
    loadCellDesign,
    totalCells,
    setTotalCells,
    copyDesign,
    pasteDesign
  }

  return <InstanceContext.Provider value={value}>{children}</InstanceContext.Provider>
}

export { InstanceContext, InstanceProvider }
