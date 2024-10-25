import React, { createContext, useState, useContext, useCallback, useEffect } from 'react'
import { useCanvas } from './CanvasContext'
import FontFaceObserver from 'fontfaceobserver'
import Papa from 'papaparse'
const InstanceContext = createContext()

export const useInstance = () => useContext(InstanceContext)

const InstanceProvider = ({ children }) => {
  const {
    canvas,
    updateSelectedColor,
    updateSelectedFont,
    selectedColor,
    selectedObject,
    selectedFont, // Importer la police depuis CanvasContext
    setSelectedFont,
    onDeleteObject,
    onAddTextCsv,
    isTextSelected,
    onAddQrCodeCsv
  } = useCanvas() // Utiliser directement CanvasContext

  const [selectedCell, setSelectedCell] = useState(0)
  const [selectedCells, setSelectedCells] = useState([])
  const [cellDesigns, setCellDesigns] = useState({})
  const [totalCells, setTotalCells] = useState(0)
  const [copiedDesign, setCopiedDesign] = useState(null)
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  // Fonction pour charger le design de la cellule sélectionnée
  const loadCellDesign = useCallback(
    (cellIndex) => {
      console.log(`Chargement du design pour la cellule ${cellIndex}`)
      if (!canvas) return

      // Effacer le contenu du canevas mais réappliquer la couleur de fond
      canvas.clear()
      canvas.backgroundColor = 'white' // Réappliquer la couleur de fond blanche

      if (cellDesigns[cellIndex]) {
        // Charger le design à partir de JSON
        canvas.loadFromJSON(cellDesigns[cellIndex], () => {
          setTimeout(() => {
            canvas.renderAll() // Re-rendu du canevas après un léger délai
          }, 10)
        })
      } else {
        canvas.renderAll() // Forcer le rendu même si la cellule est vide
      }
    },
    [canvas, cellDesigns]
  )

  const saveCellDesign = useCallback(
    async (cellIndex) => {
      if (!canvas) return
      const design = JSON.stringify(canvas.toJSON())
      setCellDesigns((prevDesigns) => ({
        ...prevDesigns,
        [cellIndex]: design
      }))
    },
    [canvas]
  )

  const importData = useCallback(
    (file) => {
      if (!canvas) return

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          for (let index = 0; index < results.data.length; index++) {
            const row = results.data[index]
            const { Nom, Tarif, Gencode } = row

            const cellIndex = index
            await loadCellDesign(cellIndex)

            if (Nom) await onAddTextCsv(Nom)
            if (Tarif) await onAddTextCsv(`${Tarif}€`)

            if (Gencode) {
              await new Promise((resolve) => {
                onAddQrCodeCsv(Gencode, resolve) // Utilise le callback pour attendre le rendu
              })
            }

            await saveCellDesign(cellIndex)
            canvas.clear()
            canvas.renderAll()
          }
        },
        error: (error) => {
          console.error("Erreur lors de l'importation du fichier CSV", error)
        }
      })
    },
    [canvas, onAddTextCsv, onAddQrCodeCsv, loadCellDesign, saveCellDesign]
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
    return new Promise((resolve) => {
      if (!canvas) return resolve()

      const currentDesign = JSON.stringify(canvas)

      console.log('Sauvegarde du design pour la cellule', selectedCell)

      setCellDesigns((prevDesigns) => {
        const updatedDesigns = { ...prevDesigns }

        selectedCells.forEach((cellIndex) => {
          if (canvas.getObjects().length > 0) {
            updatedDesigns[cellIndex] = currentDesign
            console.log(`Design sauvegardé pour la cellule ${cellIndex}`)
          } else {
            delete updatedDesigns[cellIndex]
            console.log('Suppression du design pour la cellule', cellIndex)
          }
        })

        return updatedDesigns
      })

      setUnsavedChanges(false)
      resolve()
    })
  }, [canvas, selectedCell, selectedCells])

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

      updateSelectedColor(color) // Mettre à jour la couleur dans CanvasContext
    },
    [canvas, updateSelectedColor]
  )

  const handleFontChange = useCallback(
    (font) => {
      const activeObject = canvas.getActiveObject()

      // Si aucun objet n'est actif, mettre à jour l'état seulement
      if (!activeObject || (activeObject.type !== 'i-text' && activeObject.type !== 'textbox')) {
        updateSelectedFont(font) // Mettre à jour la police dans le contexte
        return
      }

      // Charger la police avant de l'appliquer
      const fontObserver = new FontFaceObserver(font)
      fontObserver
        .load()
        .then(() => {
          // Appliquer la police si un objet actif existe
          activeObject.set('fontFamily', font)

          // Réinitialiser les dimensions et forcer le recalcul
          activeObject.set('dirty', true)
          activeObject.initDimensions()
          activeObject.setCoords()

          // Forcer le re-rendu du canevas
          canvas.renderAll()
          setUnsavedChanges(true) // Marquer les modifications comme non sauvegardées
        })
        .catch((error) => {
          console.error(`La police ${font} n'a pas pu être chargée :`, error)
        })

      updateSelectedFont(font) // Mettre à jour la police dans le contexte
    },
    [canvas, updateSelectedFont]
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
        canvas.renderAll()
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

  useEffect(() => {
    if (canvas && selectedFont) {
      // Forcer un re-rendu du canevas lorsque la police change
      canvas.renderAll()
    }
  }, [selectedFont, canvas])

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
    handleFontChange,
    selectedObject,
    selectedFont, // Utiliser la police importée depuis CanvasContext
    setSelectedFont,
    updateSelectedFont,
    unsavedChanges,
    hasDesignChanged,
    onDeleteObject,
    isTextSelected,
    importData
  }

  return <InstanceContext.Provider value={value}>{children}</InstanceContext.Provider>
}

export { InstanceContext, InstanceProvider }
