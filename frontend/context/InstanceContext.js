import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { useCanvas } from './CanvasContext'
import { instanceReducer, initialInstanceState } from '../reducers/instanceReducer'
import useCellCanvasManager from '../hooks/useCellCanvasManager'
import useCsvImporter from '../hooks/useCsvImporter'

const InstanceContext = createContext()

export const useInstance = () => useContext(InstanceContext)

const InstanceProvider = ({ children }) => {
  const { canvas, onAddTextCsv, onAddQrCodeCsv } = useCanvas()
  const [state, dispatch] = useReducer(instanceReducer, initialInstanceState)

  const { loadCellDesign, saveChanges, copyDesign, pasteDesign, clearCellDesign } =
    useCellCanvasManager(canvas, state, dispatch)
  const { importData } = useCsvImporter(canvas, onAddTextCsv, onAddQrCodeCsv, dispatch)

  // Gestion du clic sur une cellule
  const handleCellClick = useCallback(
    (labelIndex, event) => {
      if (labelIndex === state.selectedCell) return
      saveChanges()
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

  useEffect(() => {
    if (state.selectedCell !== null) loadCellDesign(state.selectedCell)
  }, [state.selectedCell, loadCellDesign])

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
    state
  }

  return <InstanceContext.Provider value={value}>{children}</InstanceContext.Provider>
}

export { InstanceContext, InstanceProvider }
