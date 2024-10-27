import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  useReducer
} from 'react'
import { useCanvas } from './CanvasContext'
import { canvasReducer, initialCanvasState } from '../reducers/canvasReducer'
import Papa from 'papaparse'

const InstanceContext = createContext()

export const useInstance = () => useContext(InstanceContext)

const InstanceProvider = ({ children }) => {
  const { canvas, onAddTextCsv, isTextSelected, onAddQrCodeCsv } = useCanvas()

  const [selectedCell, setSelectedCell] = useState(0)
  const [selectedCells, setSelectedCells] = useState([])
  const [totalCells, setTotalCells] = useState(0)
  const [copiedDesign, setCopiedDesign] = useState(null)
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  // Utilisation de useReducer pour gérer l'état du canvas avec canvasReducer
  const [state, dispatch] = useReducer(canvasReducer, initialCanvasState)

  // Fonction pour charger le design de la cellule sélectionnée
  const loadCellDesign = useCallback(
    (cellIndex) => {
      console.log(`Chargement du design pour la cellule ${cellIndex}`)
      if (!canvas) return

      canvas.clear()
      canvas.backgroundColor = 'white'

      if (state.objects[cellIndex]) {
        canvas.loadFromJSON(state.objects[cellIndex], () => {
          setTimeout(() => {
            canvas.renderAll()
          }, 10)
        })
      } else {
        canvas.renderAll()
      }
    },
    [canvas, state.objects]
  )

  // Fonction pour vérifier si le design a réellement changé
  const hasDesignChanged = useCallback(() => {
    if (!canvas) return false

    const currentDesign = JSON.stringify(canvas.toJSON())
    const savedDesign = state.objects[selectedCell]
    return currentDesign !== savedDesign
  }, [canvas, state.objects, selectedCell])

  // Sauvegarder manuellement les modifications pour les cellules sélectionnées
  const saveChanges = useCallback(() => {
    if (!canvas) return

    const currentDesign = JSON.stringify(canvas.toJSON())

    selectedCells.forEach((cellIndex) => {
      const updatedObjects = {
        ...state.objects,
        [cellIndex]: canvas.getObjects().length > 0 ? currentDesign : null
      }

      dispatch({ type: 'SET_OBJECTS', payload: updatedObjects })
    })

    setUnsavedChanges(false)
  }, [canvas, selectedCells, state.objects])

  // Gestion du clic sur une cellule (avec sélection multiple ou simple)
  const handleCellClick = useCallback(
    (labelIndex, event) => {
      if (labelIndex === selectedCell) {
        console.log('Clic sur la même cellule, aucune action nécessaire')
        return
      }

      // Si des modifications non sauvegardées sont détectées, on les sauvegarde automatiquement
      if (unsavedChanges && hasDesignChanged()) {
        saveChanges() // Sauvegarde automatique sans demande de confirmation
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

  // Copier et coller le design
  const copyDesign = useCallback(() => {
    if (canvas && typeof canvas.toJSON === 'function') {
      setCopiedDesign(JSON.stringify(canvas.toJSON()))
    }
  }, [canvas])

  const pasteDesign = useCallback(() => {
    if (!canvas || !copiedDesign) return

    selectedCells.forEach((cellIndex) => {
      canvas.clear()
      canvas.loadFromJSON(copiedDesign, () => {
        setTimeout(() => canvas.renderAll(), 10)
      })

      const updatedObjects = {
        ...state.objects,
        [cellIndex]: copiedDesign
      }
      dispatch({ type: 'SET_OBJECTS', payload: updatedObjects })
    })
  }, [canvas, copiedDesign, selectedCells, state.objects])

  // Importer des données
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
            loadCellDesign(cellIndex)

            if (Nom) await onAddTextCsv(Nom)
            if (Tarif) await onAddTextCsv(`${Tarif}€`)

            if (Gencode) {
              await new Promise((resolve) => {
                onAddQrCodeCsv(Gencode, resolve)
              })
            }

            await saveChanges()
            canvas.clear()
            canvas.renderAll()
          }
        },
        error: (error) => {
          console.error("Erreur lors de l'importation du fichier CSV", error)
        }
      })
    },
    [canvas, onAddTextCsv, onAddQrCodeCsv, loadCellDesign, saveChanges]
  )

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
    loadCellDesign,
    totalCells,
    setTotalCells,
    copyDesign,
    pasteDesign,
    saveChanges,
    unsavedChanges,
    hasDesignChanged,
    isTextSelected,
    importData,
    state
  }

  return <InstanceContext.Provider value={value}>{children}</InstanceContext.Provider>
}

export { InstanceContext, InstanceProvider }
