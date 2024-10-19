import React, { createContext, useState, useContext, useCallback, useEffect } from 'react'
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
    if (canvas && canvas.getObjects().length > 0) {
      // Vérifier si le canevas contient des objets
      const currentDesign = JSON.stringify(canvas)
      setCellDesigns((prevDesigns) => ({
        ...prevDesigns,
        [selectedCell]: currentDesign
      }))
    } else {
      // Si la cellule est vide, la retirer de cellDesigns
      setCellDesigns((prevDesigns) => {
        const newDesigns = { ...prevDesigns }
        delete newDesigns[selectedCell] // Supprimer l'entrée si elle est vide
        return newDesigns
      })
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
    setSelectedCell(labelIndex) // Mettre à jour selectedCell
    // Ne pas appeler immédiatement loadCellDesign ici
  }

  useEffect(() => {
    if (selectedCell !== null) {
      loadCellDesign(selectedCell) // Charger le design de la nouvelle cellule une fois qu'elle est bien sélectionnée
    }
  }, [selectedCell, loadCellDesign])

  // Fonction pour copier le design actuel du canvas
  const copyDesign = () => {
    if (canvas && typeof canvas.toJSON === 'function') {
      const currentDesign = JSON.stringify(canvas.toJSON()) // Copier le design du canvas
      setCopiedDesign(currentDesign)
    }
  }

  // Fonction pour coller le design dans les cellules sélectionnées
  const pasteDesign = (selectedCells, isInstance = false) => {
    if (!canvas || !copiedDesign) {
      return
    }

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
