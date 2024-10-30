import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { useCanvas } from './CanvasContext'
import { instanceReducer, initialInstanceState } from '../reducers/instanceReducer'
import useCellCanvasManager from '../hooks/useCellCanvasManager'
import useCsvImporter from '../hooks/useCsvImporter'

const InstanceContext = createContext()

export const useInstance = () => useContext(InstanceContext)

const InstanceProvider = ({ children }) => {
  const { canvas, canvasState, onAddTextCsv, onAddQrCodeCsv } = useCanvas()
  const [instanceState, dispatchInstanceAction] = useReducer(instanceReducer, initialInstanceState)

  const { loadCellDesign, saveChanges, copyDesign, pasteDesign, clearCellDesign } =
    useCellCanvasManager(canvas, instanceState, dispatchInstanceAction, canvasState)

  const { importData } = useCsvImporter(
    canvas,
    onAddTextCsv,
    onAddQrCodeCsv,
    dispatchInstanceAction
  )

  // Gestion du clic sur une cellule
  const handleCellClick = useCallback(
    (labelIndex, event) => {
      if (labelIndex === instanceState.selectedCell) return
      saveChanges()
      dispatchInstanceAction({
        type: 'SET_SELECTED_CELLS',
        payload:
          event.ctrlKey || event.metaKey
            ? instanceState.selectedCells.includes(labelIndex)
              ? instanceState.selectedCells.filter((index) => index !== labelIndex)
              : [...instanceState.selectedCells, labelIndex]
            : [labelIndex]
      })
      dispatchInstanceAction({ type: 'SET_SELECTED_CELL', payload: labelIndex })
    },
    [saveChanges, instanceState.selectedCell, instanceState.selectedCells]
  )

  useEffect(() => {
    if (instanceState.selectedCell !== null) loadCellDesign(instanceState.selectedCell)
  }, [instanceState.selectedCell, loadCellDesign])

  useEffect(() => {
    dispatchInstanceAction({ type: 'SET_SELECTED_CELL', payload: 0 })
    dispatchInstanceAction({ type: 'SET_SELECTED_CELLS', payload: [0] })
  }, [])

  const value = {
    ...instanceState,
    handleCellClick,
    loadCellDesign,
    copyDesign,
    pasteDesign,
    clearCellDesign,
    saveChanges,
    importData,
    dispatchInstanceAction,
    instanceState
  }

  return <InstanceContext.Provider value={value}>{children}</InstanceContext.Provider>
}

export { InstanceContext, InstanceProvider }
