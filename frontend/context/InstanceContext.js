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
  // useEffect(() => {
  //   if (canvas) {
  //     const saveChanges = () => {
  //       const currentDesign = JSON.stringify(canvas)

  //       console.log('Tentative de sauvegarde du design pour la cellule:', selectedCell)
  //       console.log('Design actuel du canvas:', currentDesign)

  //       if (canvas.getObjects().length > 0 && cellDesigns[selectedCell] !== currentDesign) {
  //         setCellDesigns((prevDesigns) => ({
  //           ...prevDesigns,
  //           [selectedCell]: currentDesign
  //         }))
  //         console.log('Design mis à jour pour la cellule:', selectedCell)
  //         console.log('Nouveau cellDesigns:', { ...cellDesigns, [selectedCell]: currentDesign })
  //       } else if (canvas.getObjects().length === 0 && cellDesigns[selectedCell]) {
  //         console.log('Suppression du design pour la cellule', selectedCell)

  //         setCellDesigns((prevDesigns) => {
  //           const newDesigns = { ...prevDesigns }
  //           delete newDesigns[selectedCell]
  //           return newDesigns
  //         })
  //       }
  //     }

  //     canvas.on('object:modified', saveChanges)
  //     canvas.on('object:added', saveChanges)

  //     return () => {
  //       canvas.off('object:modified', saveChanges)
  //       canvas.off('object:added', saveChanges)
  //     }
  //   }
  // }, [canvas, selectedCell, cellDesigns])

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

  // Fonction pour gérer le clic sur une cellule (avec sélection multiple)
  const handleCellClick = (labelIndex, event) => {
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
      console.log('Design copié:', currentDesign) // Log pour débogage
    }
  }, [canvas])

  // Fonction pour coller le design dans les cellules sélectionnées
  const pasteDesign = useCallback(
    (selectedCells) => {
      if (!canvas || !copiedDesign) {
        console.log('Erreur: Canvas ou design copié non défini')
        return
      }

      // Parcourir toutes les cellules sélectionnées
      selectedCells.forEach((cellIndex) => {
        console.log(`Collage du design dans la cellule ${cellIndex}`)

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

  // Modifier la logique de sauvegarde
  useEffect(() => {
    if (canvas) {
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
      }

      canvas.on('object:modified', saveChanges)
      canvas.on('object:added', saveChanges)

      return () => {
        canvas.off('object:modified', saveChanges)
        canvas.off('object:added', saveChanges)
      }
    }
  }, [canvas, selectedCells, cellDesigns, selectedCell])

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
