import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useReducer,
  useState,
  useRef
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
  const objectsRef = useRef(state.objects)

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
      // Vérifier si le canvas a du contenu avant de sauvegarder
      if (canvas.getObjects().length > 0) {
        updatedObjects[cellIndex] = currentDesign
      } else {
        // Si la cellule est vide, la retirer de `objects`
        delete updatedObjects[cellIndex]
      }

      // Vérifiez si cette cellule a des instances liées
      if (state.linkedCells[cellIndex]) {
        dispatch({
          type: 'UPDATE_LINKED_CELLS',
          payload: { primaryCell: cellIndex, design: currentDesign }
        })
      }
    })

    dispatch({ type: 'SET_OBJECTS', payload: updatedObjects })
    setRefresh((prev) => !prev)
  }, [canvas, state.selectedCells, state.linkedCells, state.objects, dispatch])

  useEffect(() => {
    objectsRef.current = state.objects
  }, [state.objects])

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

  // Fonction pour vider le design de la cellule sélectionnée
  const clearCellDesign = useCallback(
    (cellIndex) => {
      if (!canvas) return
      canvas.clear()
      canvas.backgroundColor = 'white'
      canvas.requestRenderAll() // Forcer le rendu visuel

      dispatch({
        type: 'CLEAR_CELL_DESIGN',
        payload: { cellIndex }
      })
    },
    [canvas, dispatch]
  )

  // Importer des données
  // Met à jour `objectsRef` lorsque `state.objects` change
  useEffect(() => {
    objectsRef.current = state.objects
  }, [state.objects])

  const importData = useCallback(
    (file) => {
      if (!canvas) return

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const newObjects = { ...objectsRef.current }
          const importedCellIndices = [] // Stocker les indices des cellules importées

          for (let index = 0; index < results.data.length; index++) {
            const { Nom, Tarif, Gencode } = results.data[index]
            const cellIndex = index

            // Efface le canevas avant d'ajouter du contenu
            canvas.clear()
            canvas.backgroundColor = 'white'
            canvas.renderAll()

            // Ajoute les données pour chaque cellule importée
            if (Nom) await onAddTextCsv(Nom)
            if (Tarif) await onAddTextCsv(`${Tarif}€`)
            if (Gencode) await new Promise((resolve) => onAddQrCodeCsv(Gencode, resolve))

            // Sauvegarder le design JSON de la cellule courante
            const currentDesign = JSON.stringify(canvas.toJSON())
            newObjects[cellIndex] = currentDesign
            importedCellIndices.push(cellIndex) // Ajouter l'index à la liste des cellules importées

            // Nettoyer le canevas pour la cellule suivante
            canvas.clear()
            canvas.backgroundColor = 'white'
            canvas.renderAll()
          }

          // Met à jour `objects` dans le reducer
          dispatch({ type: 'SET_OBJECTS', payload: newObjects })

          // Vérifie si des cellules ont été importées pour les lier ensemble
          if (importedCellIndices.length > 1) {
            // Associe les cellules importées entre elles
            dispatch({
              type: 'ADD_LINKED_CELLS',
              payload: {
                primaryCell: importedCellIndices[0],
                linkedCellIndices: importedCellIndices.slice(1)
              }
            })
          }

          // Rafraîchit l'affichage
          setRefresh((prev) => !prev)
        },
        error: (error) => console.error("Erreur lors de l'importation du fichier CSV", error)
      })
    },
    [canvas, onAddTextCsv, onAddQrCodeCsv, dispatch]
  )

  const createLinkedCells = useCallback(
    (primaryCell, linkedCellIndices) => {
      const primaryDesign = state.objects[primaryCell]
      if (!primaryDesign) return

      // Ajouter les cellules liées dans l’état global
      dispatch({
        type: 'ADD_LINKED_CELLS',
        payload: { primaryCell, linkedCellIndices }
      })

      // Appliquer le design de la cellule principale aux cellules liées
      linkedCellIndices.forEach((cellIndex) => {
        dispatch({
          type: 'SAVE_CELL_DESIGN',
          payload: { cellIndex, design: primaryDesign }
        })
      })
    },
    [dispatch, state.objects]
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
    clearCellDesign,
    saveChanges,
    importData,
    dispatch,
    createLinkedCells,
    state
  }

  return <InstanceContext.Provider value={value}>{children}</InstanceContext.Provider>
}

export { InstanceContext, InstanceProvider }
