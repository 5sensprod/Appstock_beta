// hooks/useCellCanvasManager.js
import { useCallback } from 'react'

const useCellCanvasManager = (canvas, state, dispatch) => {
  // Charger le design d’une cellule dans le canevas
  const loadCellDesign = useCallback(
    (cellIndex) => {
      if (!canvas || state.selectedCell === cellIndex) return // Évite de recharger le même design
      canvas.clear()
      canvas.backgroundColor = 'white'

      const design = state.objects[cellIndex]
      if (design) {
        canvas.loadFromJSON(design, () => canvas.requestRenderAll())
      } else {
        canvas.requestRenderAll()
      }
    },
    [canvas, state.selectedCell, state.objects]
  )

  // Sauvegarder les modifications, seulement si le design est modifié
  const saveChanges = useCallback(() => {
    if (!canvas) return

    const currentDesign = JSON.stringify(canvas.toJSON())
    const updatedObjects = { ...state.objects }

    state.selectedCells.forEach((cellIndex) => {
      if (canvas.getObjects().length > 0) {
        if (updatedObjects[cellIndex] !== currentDesign) {
          // Sauvegarde seulement si modifié
          updatedObjects[cellIndex] = currentDesign
        }
      } else {
        delete updatedObjects[cellIndex]
      }

      if (state.linkedCells[cellIndex]) {
        dispatch({
          type: 'UPDATE_LINKED_CELLS',
          payload: { primaryCell: cellIndex, design: currentDesign }
        })
      }
    })

    dispatch({ type: 'SET_OBJECTS', payload: updatedObjects })
  }, [canvas, state.selectedCells, state.linkedCells, state.objects, dispatch])

  // Copier et coller le design
  const copyDesign = useCallback(() => {
    if (canvas) dispatch({ type: 'SET_COPIED_DESIGN', payload: JSON.stringify(canvas.toJSON()) })
  }, [canvas, dispatch])

  const pasteDesign = useCallback(() => {
    if (!canvas || !state.copiedDesign) return
    state.selectedCells.forEach((cellIndex) => {
      canvas.clear()
      canvas.loadFromJSON(state.copiedDesign, () => canvas.requestRenderAll())
      dispatch({ type: 'SAVE_CELL_DESIGN', payload: { cellIndex, design: state.copiedDesign } })
    })
  }, [canvas, state.copiedDesign, state.selectedCells, dispatch])

  // Fonction pour vider le design d’une cellule
  const clearCellDesign = useCallback(
    (cellIndex) => {
      if (!canvas) return
      canvas.clear()
      canvas.backgroundColor = 'white'
      canvas.requestRenderAll()
      dispatch({ type: 'CLEAR_CELL_DESIGN', payload: { cellIndex } })
    },
    [canvas, dispatch]
  )

  return {
    loadCellDesign,
    saveChanges,
    copyDesign,
    pasteDesign,
    clearCellDesign
  }
}

export default useCellCanvasManager
