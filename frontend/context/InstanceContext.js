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

  // Sauvegarde automatique lorsque le canevas est modifié
  // Logique unifiée pour la sauvegarde du canevas
  useEffect(() => {
    if (canvas) {
      const saveChangesOnDeselection = () => {
        const currentDesign = JSON.stringify(canvas)

        // Sauvegarder le design pour chaque cellule sélectionnée
        selectedCells.forEach((cellIndex) => {
          if (canvas.getObjects().length > 0 && cellDesigns[cellIndex] !== currentDesign) {
            setCellDesigns((prevDesigns) => ({
              ...prevDesigns,
              [cellIndex]: currentDesign
            }))
          } else if (canvas.getObjects().length === 0 && cellDesigns[cellIndex]) {
            setCellDesigns((prevDesigns) => {
              const newDesigns = { ...prevDesigns }
              delete newDesigns[cellIndex]
              return newDesigns
            })
          }
        })
      }

      // Attacher l'événement pour détecter la désélection d'un objet
      canvas.on('selection:cleared', saveChangesOnDeselection)

      // Nettoyer les événements lors du démontage
      return () => {
        canvas.off('selection:cleared', saveChangesOnDeselection)
      }
    }
  }, [canvas, selectedCells, cellDesigns])

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

  // Fonction pour gérer le clic sur une cellule (avec sélection multiple)
  const handleCellClick = (labelIndex, event) => {
    // Vérifier si le canevas existe
    if (canvas) {
      // Désélectionner l'objet actif sur le canevas
      canvas.discardActiveObject()
      canvas.renderAll() // Redessiner le canevas pour appliquer la désélection
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
        // Appliquer le design copié à chaque cellule
        setCellDesigns((prevDesigns) => ({
          ...prevDesigns,
          [cellIndex]: copiedDesign
        }))

        // Charger le design dans la cellule courante
        loadCellDesign(cellIndex)
      })

      // Il n'est plus nécessaire d'appeler loadCellDesign ici, car nous l'appelons déjà dans la boucle
    },
    [canvas, copiedDesign, loadCellDesign]
  )

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
    pasteDesign
  }

  return <InstanceContext.Provider value={value}>{children}</InstanceContext.Provider>
}

export { InstanceContext, InstanceProvider }
