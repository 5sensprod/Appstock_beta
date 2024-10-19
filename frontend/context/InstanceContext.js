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
  const [selectedCells, setSelectedCells] = useState([0]) // Gestion des cellules sélectionnées (la première est sélectionnée par défaut)

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

  // Gestion de la sélection multiple
  const handleCellClick = (labelIndex, isMultiSelect = false) => {
    saveDesignForSelectedCell()

    if (isMultiSelect) {
      // Ajouter ou retirer la cellule sélectionnée
      setSelectedCells((prevSelectedCells) => {
        if (prevSelectedCells.includes(labelIndex)) {
          // Si la cellule est déjà sélectionnée, la désélectionner
          return prevSelectedCells.filter((cell) => cell !== labelIndex)
        } else {
          // Sinon, ajouter la cellule à la sélection multiple
          return [...prevSelectedCells, labelIndex]
        }
      })
    } else {
      // Sélection simple (une seule cellule sélectionnée)
      setSelectedCells([labelIndex])
      setSelectedCell(labelIndex) // Mettre à jour selectedCell pour une seule sélection
    }
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
  const pasteDesign = (isInstance = false) => {
    if (!canvas || !copiedDesign || selectedCells.length === 0) {
      return
    }

    selectedCells.forEach((cellIndex) => {
      // Appliquer le design dans chaque cellule sélectionnée
      setCellDesigns((prevDesigns) => ({
        ...prevDesigns,
        [cellIndex]: copiedDesign
      }))

      // Charger le design dans la cellule après avoir mis à jour le design
      loadCellDesign(cellIndex)
    })
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
