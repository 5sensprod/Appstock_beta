import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useReducer,
  useState
} from 'react'
import { useCanvas } from './CanvasContext'
import { instanceReducer, initialInstanceState } from '../reducers/instanceReducer'
import Papa from 'papaparse'

const InstanceContext = createContext()

export const useInstance = () => useContext(InstanceContext)

const InstanceProvider = ({ children }) => {
  const { canvas, onAddTextCsv, onAddQrCodeCsv } = useCanvas()

  // Reducer pour gérer l’état des cellules
  const [state, dispatch] = useReducer(instanceReducer, initialInstanceState)
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
    state.selectedCells.forEach((cellIndex) => {
      updatedObjects[cellIndex] = canvas.getObjects().length > 0 ? currentDesign : null
    })
    dispatch({ type: 'SET_OBJECTS', payload: updatedObjects })
    setRefresh((prev) => !prev) // Inversion pour déclencher le rendu
  }, [canvas, state.selectedCells, state.objects])

  // Gestion du clic sur une cellule
  const handleCellClick = useCallback(
    (labelIndex, event) => {
      if (labelIndex === state.selectedCell) return
      saveChanges() // Appelle `saveChanges` lors du changement de cellule
      dispatch({
        type: 'SET_SELECTED_CELLS',
        payload:
          event.ctrlKey || event.metaKey
            ? state.selectedCells.includes(labelIndex)
              ? state.selectedCells.filter((index) => index !== labelIndex)
              : [...state.selectedCells, labelIndex]
            : [labelIndex]
      })
      dispatch({ type: 'SET_SELECTED_CELL', payload: labelIndex })
    },
    [saveChanges, state.selectedCell, state.selectedCells]
  )

  // Copier et coller le design
  const copyDesign = useCallback(() => {
    if (canvas) dispatch({ type: 'SET_COPIED_DESIGN', payload: JSON.stringify(canvas.toJSON()) })
  }, [canvas])

  const pasteDesign = useCallback(() => {
    if (!canvas || !state.copiedDesign) return
    state.selectedCells.forEach((cellIndex) => {
      canvas.clear()
      canvas.loadFromJSON(state.copiedDesign, () => {
        canvas.requestRenderAll() // Forcer le rendu
      })
      dispatch({
        type: 'SAVE_CELL_DESIGN',
        payload: { cellIndex, design: state.copiedDesign }
      })
    })
    setRefresh((prev) => !prev) // Inversion pour déclencher le rendu
  }, [canvas, state.copiedDesign, state.selectedCells])

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
    if (state.selectedCell !== null) loadCellDesign(state.selectedCell)
  }, [state.selectedCell, loadCellDesign, refresh])

  // Initialisation des cellules au chargement
  useEffect(() => {
    dispatch({ type: 'SET_SELECTED_CELL', payload: 0 })
    dispatch({ type: 'SET_SELECTED_CELLS', payload: [0] })
  }, [])

  const value = {
    ...state,
    handleCellClick,
    loadCellDesign,
    copyDesign,
    pasteDesign,
    saveChanges,
    importData,
    dispatch,
    state
  }

  return <InstanceContext.Provider value={value}>{children}</InstanceContext.Provider>
}

export { InstanceContext, InstanceProvider }
