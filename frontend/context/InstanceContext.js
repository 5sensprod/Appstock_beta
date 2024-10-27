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

  // État spécifique aux cellules
  const [selectedCell, setSelectedCell] = useState(0)
  const [selectedCells, setSelectedCells] = useState([])
  const [totalCells, setTotalCells] = useState(0)
  const [copiedDesign, setCopiedDesign] = useState(null)

  // Reducer pour la gestion des objets et forcer le rafraîchissement
  const [state, localDispatch] = useReducer(canvasReducer, initialCanvasState)
  const [refresh, setRefresh] = useState(false) // État pour forcer le rendu

  // Fonction pour charger le design de la cellule sélectionnée
  const loadCellDesign = useCallback(
    (cellIndex) => {
      if (!canvas) return
      canvas.clear()
      canvas.backgroundColor = 'white'
      const design = state.objects[cellIndex]
      if (design) {
        canvas.loadFromJSON(design, () => {
          canvas.requestRenderAll() // Forcer le rendu
        })
      } else {
        canvas.requestRenderAll()
      }
    },
    [canvas, state.objects]
  )

  // Sauvegarde des modifications pour les cellules sélectionnées
  const saveChanges = useCallback(() => {
    if (!canvas) return
    const currentDesign = JSON.stringify(canvas.toJSON())
    const updatedObjects = { ...state.objects }
    selectedCells.forEach((cellIndex) => {
      updatedObjects[cellIndex] = canvas.getObjects().length > 0 ? currentDesign : null
    })
    localDispatch({ type: 'SET_OBJECTS', payload: updatedObjects })
    setRefresh((prev) => !prev) // Inversion pour déclencher le rendu
  }, [canvas, selectedCells, state.objects])

  // Gestion du clic sur une cellule
  const handleCellClick = useCallback(
    (labelIndex, event) => {
      if (labelIndex === selectedCell) return
      saveChanges() // Appelle `saveChanges` lors du changement de cellule
      setSelectedCells((prevSelectedCells) =>
        event.ctrlKey || event.metaKey
          ? prevSelectedCells.includes(labelIndex)
            ? prevSelectedCells.filter((index) => index !== labelIndex)
            : [...prevSelectedCells, labelIndex]
          : [labelIndex]
      )
      setSelectedCell(labelIndex)
    },
    [saveChanges, selectedCell]
  )

  // Copier et coller le design
  const copyDesign = useCallback(() => {
    if (canvas) setCopiedDesign(JSON.stringify(canvas.toJSON()))
  }, [canvas])

  const pasteDesign = useCallback(() => {
    if (!canvas || !copiedDesign) return
    selectedCells.forEach((cellIndex) => {
      canvas.clear()
      canvas.loadFromJSON(copiedDesign, () => {
        canvas.requestRenderAll() // Forcer le rendu
      })
      localDispatch({
        type: 'SAVE_CELL_DESIGN',
        payload: { cellIndex, design: copiedDesign }
      })
    })
    setRefresh((prev) => !prev) // Inversion pour déclencher le rendu
  }, [canvas, copiedDesign, selectedCells])

  // Importer des données
  const importData = useCallback(
    (file) => {
      if (!canvas) return
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          for (let index = 0; index < results.data.length; index++) {
            const { Nom, Tarif, Gencode } = results.data[index]
            const cellIndex = index
            loadCellDesign(cellIndex)
            if (Nom) await onAddTextCsv(Nom)
            if (Tarif) await onAddTextCsv(`${Tarif}€`)
            if (Gencode) await new Promise((resolve) => onAddQrCodeCsv(Gencode, resolve))
            saveChanges()
            canvas.clear()
            canvas.requestRenderAll()
          }
        },
        error: (error) => console.error("Erreur lors de l'importation du fichier CSV", error)
      })
    },
    [canvas, loadCellDesign, onAddQrCodeCsv, onAddTextCsv, saveChanges]
  )

  // Charger automatiquement le design de la cellule sélectionnée
  useEffect(() => {
    if (selectedCell !== null) loadCellDesign(selectedCell)
  }, [selectedCell, loadCellDesign, refresh])

  // Initialisation des cellules au chargement
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
    isTextSelected,
    importData,
    state
  }

  return <InstanceContext.Provider value={value}>{children}</InstanceContext.Provider>
}

export { InstanceContext, InstanceProvider }
