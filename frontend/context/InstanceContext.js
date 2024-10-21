import React, { createContext, useState, useContext, useCallback, useEffect } from 'react'
import { useCanvas } from './CanvasContext'
import useCanvasEvents from '../hooks/useCanvasEvents'

const InstanceContext = createContext()

export const useInstance = () => useContext(InstanceContext)

const InstanceProvider = ({ children }) => {
  const { canvas, updateSelectedColor } = useCanvas()
  const [selectedCell, setSelectedCell] = useState(0) // Cellule sélectionnée par défaut
  const [selectedCells, setSelectedCells] = useState([]) // Gestion des cellules sélectionnées multiples
  const [cellDesigns, setCellDesigns] = useState({}) // Gestion des designs par cellule
  const [totalCells, setTotalCells] = useState(0) // Nombre total de cellules
  const [copiedDesign, setCopiedDesign] = useState(null) // Design copié pour collage
  const [unsavedChanges, setUnsavedChanges] = useState(false) // Suivi des changements non sauvegardés
  const [selectedColor, setSelectedColor] = useState('#000000') // Gestion de la couleur sélectionnée
  const [selectedObject, setSelectedObject] = useState(null)

  useCanvasEvents(canvas, setSelectedObject, setSelectedColor)

  // Fonction pour charger le design de la cellule sélectionnée
  const loadCellDesign = useCallback(
    (cellIndex) => {
      console.log(`Chargement du design pour la cellule ${cellIndex}`)
      if (!canvas) return

      canvas.clear()

      if (cellDesigns[cellIndex]) {
        canvas.loadFromJSON(cellDesigns[cellIndex], () => {
          setTimeout(() => canvas.renderAll(), 10) // Re-rendu du canevas après un léger délai
        })
      } else {
        canvas.renderAll() // Forcer le rendu même si la cellule est vide
      }
    },
    [canvas, cellDesigns]
  )

  // Fonction pour vérifier si le design a réellement changé
  const hasDesignChanged = useCallback(() => {
    if (!canvas) return false

    const currentDesign = JSON.stringify(canvas.toJSON())
    const savedDesign = cellDesigns[selectedCell]
    return currentDesign !== savedDesign
  }, [canvas, cellDesigns, selectedCell])

  // Sauvegarder manuellement les modifications pour les cellules sélectionnées
  const saveChanges = useCallback(() => {
    if (!canvas) return
    const currentDesign = JSON.stringify(canvas)

    console.log('Sauvegarde du design pour la cellule', selectedCell)

    setCellDesigns((prevDesigns) => {
      const updatedDesigns = { ...prevDesigns }

      selectedCells.forEach((cellIndex) => {
        if (canvas.getObjects().length > 0) {
          updatedDesigns[cellIndex] = currentDesign
        } else {
          delete updatedDesigns[cellIndex]
          console.log('Suppression du design pour la cellule', cellIndex)
        }
      })

      return updatedDesigns
    })

    setUnsavedChanges(false)
  }, [canvas, selectedCell, selectedCells])

  // Gérer le changement de couleur des objets
  // Fonction pour gérer le changement de couleur des objets
  const handleColorChange = useCallback(
    (color) => {
      const activeObject = canvas.getActiveObject()
      if (activeObject) {
        activeObject.set('fill', color)
        canvas.renderAll()
        canvas.fire('object:modified', { target: activeObject })
        setUnsavedChanges(true)
      }

      setSelectedColor(color)
      updateSelectedColor(color) // Mettre à jour la couleur dans CanvasContext
    },
    [canvas, updateSelectedColor]
  )
  // Gestion du clic sur une cellule (avec sélection multiple ou simple)
  const handleCellClick = useCallback(
    (labelIndex, event) => {
      if (labelIndex === selectedCell) {
        console.log('Clic sur la même cellule, aucune action nécessaire')
        return
      }

      if (unsavedChanges && hasDesignChanged()) {
        const confirmSave = window.confirm(
          'Vous avez des modifications non sauvegardées. Voulez-vous sauvegarder avant de quitter ?'
        )
        if (confirmSave) saveChanges()
      }

      if (canvas) {
        canvas.discardActiveObject()
        canvas.renderAll() // Annuler la sélection et forcer le rendu
      }

      setSelectedCells((prevSelectedCells) => {
        return event.ctrlKey || event.metaKey
          ? prevSelectedCells.includes(labelIndex)
            ? prevSelectedCells.filter((index) => index !== labelIndex)
            : [...prevSelectedCells, labelIndex]
          : [labelIndex]
      })

      setSelectedCell(labelIndex)
      setUnsavedChanges(false) // Réinitialiser l'état des modifications non sauvegardées
    },
    [selectedCell, unsavedChanges, hasDesignChanged, saveChanges, canvas]
  )

  // Copier le design actuel du canevas
  const copyDesign = useCallback(() => {
    if (canvas && typeof canvas.toJSON === 'function') {
      const currentDesign = JSON.stringify(canvas.toJSON())
      setCopiedDesign(currentDesign)
      console.log('Design copié:', currentDesign)
    }
  }, [canvas])

  // Coller le design dans les cellules sélectionnées
  const pasteDesign = useCallback(() => {
    if (!canvas || !copiedDesign) return

    selectedCells.forEach((cellIndex) => {
      canvas.clear()
      canvas.loadFromJSON(copiedDesign, () => {
        setTimeout(() => canvas.renderAll(), 10)
      })

      setCellDesigns((prevDesigns) => ({
        ...prevDesigns,
        [cellIndex]: copiedDesign
      }))
    })
  }, [canvas, copiedDesign, selectedCells])

  // Détection des modifications sur le canevas
  useEffect(() => {
    if (!canvas) return

    const handleObjectModified = () => {
      if (hasDesignChanged()) {
        setUnsavedChanges(true)
      }
    }

    canvas.on('object:modified', handleObjectModified)
    canvas.on('object:added', handleObjectModified)

    return () => {
      canvas.off('object:modified', handleObjectModified)
      canvas.off('object:added', handleObjectModified)
    }
  }, [canvas, hasDesignChanged])

  // Charger le design de la cellule au changement de sélection
  useEffect(() => {
    if (selectedCell !== null) loadCellDesign(selectedCell)
  }, [selectedCell, loadCellDesign])

  // Sélectionner automatiquement la première cellule au chargement
  useEffect(() => {
    setSelectedCell(0)
    setSelectedCells([0])
  }, [])

  const value = {
    selectedCell,
    setSelectedCell,
    handleCellClick,
    selectedCells,
    setSelectedCells,
    cellDesigns,
    loadCellDesign,
    totalCells,
    setTotalCells,
    copyDesign,
    pasteDesign,
    saveChanges,
    selectedColor,
    handleColorChange,
    selectedObject
  }

  return <InstanceContext.Provider value={value}>{children}</InstanceContext.Provider>
}

export { InstanceContext, InstanceProvider }
