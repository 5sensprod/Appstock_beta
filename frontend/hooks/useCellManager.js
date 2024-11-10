// hooks/useCellManager.js

import { useReducer, useCallback } from 'react'
import { cellReducer, initialState } from '../reducers/cellReducer'
import { useGrid } from '../context/GridContext'

const useCellManager = () => {
  const [state, dispatch] = useReducer(cellReducer, initialState)
  const { dispatchGridAction } = useGrid()

  const importData = useCallback(
    (file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        const rows = text.split('\n').filter((row) => row.trim())
        const cells = rows.slice(1).map((row) => {
          const [name = '', price = '0', gencode = ''] = row.split(',').map((val) => val.trim())
          return { name, price, gencode }
        })
        dispatch({ type: 'IMPORT_DATA', payload: cells })
        cells.forEach((_, index) => {
          dispatchGridAction({
            type: 'LINK_CELLS_TO_CSV',
            payload: { dataIndex: index, cellIds: [index] } // Ex: liaison d'une cellule par ligne
          })
        })
      }

      reader.readAsText(file)
    },
    [dispatch, dispatchGridAction]
  )

  const selectCell = useCallback(
    (index) => {
      dispatchGridAction({ type: 'SELECT_CELL', payload: index })
    },
    [dispatchGridAction]
  )

  const updateStyle = (property, value) => {
    dispatch({ type: 'UPDATE_STYLE', payload: { [property]: value } })
  }

  const updateObjectColor = (objectType, color) => {
    dispatch({ type: 'UPDATE_OBJECT_COLOR', payload: { objectType, color } })
  }

  // *** Ajout de 'dispatch' ici ***
  return {
    state,
    dispatch,
    importData,
    updateStyle,
    selectCell,
    updateObjectColor
  }
}

export default useCellManager
