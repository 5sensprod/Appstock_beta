import React, { createContext, useState, useContext, useCallback, useEffect } from 'react'
import { useCanvas } from './CanvasContext'

const InstanceContext = createContext()

export const useInstance = () => useContext(InstanceContext)

const InstanceProvider = ({ children }) => {
  const { canvas } = useCanvas()
  const [selectedCell, setSelectedCell] = useState(0) // Cellule sélectionnée par défaut
  const [selectedCells, setSelectedCells] = useState([]) // Gestion des cellules sélectionnées multiples
  const [cellDesigns, setCellDesigns] = useState({})
  const [totalCells, setTotalCells] = useState(0)
  const [copiedDesign, setCopiedDesign] = useState(null)
  const [unsavedChanges, setUnsavedChanges] = useState(false) // Gérer les changements non sauvegardés

  // Fonction pour charger le design de la cellule sélectionnée
  const loadCellDesign = useCallback(
    (cellIndex) => {
      console.log(`Chargement du design pour la cellule ${cellIndex}`)
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

  // Fonction pour vérifier si le design a réellement changé
  const hasDesignChanged = useCallback(() => {
    if (!canvas) return false

    const currentDesign = JSON.stringify(canvas.toJSON())
    const savedDesign = cellDesigns[selectedCell]

    return currentDesign !== savedDesign // Retourne true si le design a changé
  }, [canvas, cellDesigns, selectedCell])

  // Fonction pour gérer le clic sur une cellule (avec sélection multiple)
  const handleCellClick = (labelIndex, event) => {
    // Vérifier si l'utilisateur clique sur la cellule déjà sélectionnée
    if (labelIndex === selectedCell) {
      console.log('Clic sur la même cellule, aucune action nécessaire')
      return
    }

    // Vérifier s'il y a des changements non sauvegardés uniquement si le design a changé
    if (unsavedChanges && hasDesignChanged()) {
      const confirmSave = window.confirm(
        'Vous avez des modifications non sauvegardées. Voulez-vous sauvegarder avant de quitter ?'
      )

      if (confirmSave) {
        saveChanges() // Sauvegarder les modifications
      }
    }

    if (canvas) {
      // Désélectionner tous les objets du canevas avant de changer de cellule
      canvas.discardActiveObject() // Annuler la sélection de tous les objets
      canvas.renderAll() // Forcer le rendu pour appliquer la désélection
    }

    if (event.ctrlKey || event.metaKey) {
      // Sélection multiple avec Ctrl ou Cmd
      setSelectedCells((prevSelectedCells) => {
        if (prevSelectedCells.includes(labelIndex)) {
          // Si la cellule est déjà sélectionnée, la retirer
          return prevSelectedCells.filter((index) => index !== labelIndex)
        } else {
          // Sinon, l'ajouter à la sélection
          return [...prevSelectedCells, labelIndex]
        }
      })
    } else {
      // Sélection unique si Ctrl/Cmd n'est pas enfoncé
      setSelectedCells([labelIndex])
      setSelectedCell(labelIndex)
      setUnsavedChanges(false) // Réinitialiser l'état des modifications non sauvegardées
    }
  }

  // Activer la première cellule au montage
  useEffect(() => {
    setSelectedCell(0) // Sélectionner automatiquement la première cellule au chargement
    setSelectedCells([0]) // Ajouter cette cellule à la sélection multiple
  }, [])

  // Charger le design des cellules lorsqu'elles sont sélectionnées
  useEffect(() => {
    if (selectedCell !== null) {
      loadCellDesign(selectedCell) // Charger le design de la nouvelle cellule sélectionnée
    }
  }, [selectedCell, loadCellDesign])

  // Fonction pour copier le design actuel du canvas
  const copyDesign = useCallback(() => {
    if (canvas && typeof canvas.toJSON === 'function') {
      const currentDesign = JSON.stringify(canvas.toJSON())
      setCopiedDesign(currentDesign)
      console.log('Design copié:', currentDesign) // Log pour débogage
    }
  }, [canvas])

  // Fonction pour coller le design dans les cellules sélectionnées
  const pasteDesign = useCallback(
    (selectedCells) => {
      if (!canvas || !copiedDesign) {
        return
      }

      // Parcourir toutes les cellules sélectionnées
      selectedCells.forEach((cellIndex) => {
        canvas.clear() // Effacer le contenu actuel de la cellule
        canvas.loadFromJSON(copiedDesign, () => {
          setTimeout(() => {
            canvas.renderAll() // Re-rendu du canevas après un léger délai
          }, 10)
        })

        // Appliquer le design copié à chaque cellule dans l'état
        setCellDesigns((prevDesigns) => ({
          ...prevDesigns,
          [cellIndex]: copiedDesign
        }))
      })
    },
    [canvas, copiedDesign, setCellDesigns]
  )

  // Fonction pour sauvegarder manuellement les modifications
  const saveChanges = () => {
    const currentDesign = JSON.stringify(canvas)

    console.log('Sauvegarde du design pour la cellule', selectedCell)

    // Sauvegarder le design pour chaque cellule sélectionnée
    selectedCells.forEach((cellIndex) => {
      if (canvas.getObjects().length > 0 && cellDesigns[cellIndex] !== currentDesign) {
        setCellDesigns((prevDesigns) => ({
          ...prevDesigns,
          [cellIndex]: currentDesign
        }))
      } else if (canvas.getObjects().length === 0 && cellDesigns[cellIndex]) {
        console.log('Suppression du design pour la cellule', cellIndex)

        setCellDesigns((prevDesigns) => {
          const newDesigns = { ...prevDesigns }
          delete newDesigns[cellIndex]
          return newDesigns
        })
      }
    })

    setUnsavedChanges(false) // Les modifications sont sauvegardées
  }

  // Détection des modifications sur le canvas
  useEffect(() => {
    if (canvas) {
      const handleObjectModified = () => {
        // Ne marquer comme modifié que si le design a vraiment changé
        if (hasDesignChanged()) {
          setUnsavedChanges(true) // Marquer la cellule comme ayant des modifications non sauvegardées
        }
      }

      // Attacher les événements
      canvas.on('object:modified', handleObjectModified) // Pour modifications
      canvas.on('object:added', handleObjectModified) // Marquer comme modifié après ajout

      return () => {
        // Nettoyer les événements
        canvas.off('object:modified', handleObjectModified)
        canvas.off('object:added', handleObjectModified)
      }
    }
  }, [canvas, selectedCell, cellDesigns, hasDesignChanged])

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
    saveChanges
  }

  return <InstanceContext.Provider value={value}>{children}</InstanceContext.Provider>
}

export { InstanceContext, InstanceProvider }
