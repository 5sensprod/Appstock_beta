// hooks/useCellManager.js

import { useReducer, useCallback } from 'react'
import { cellReducer, initialState } from '../reducers/cellReducer'

const useCellManager = () => {
  const [state, dispatch] = useReducer(cellReducer, initialState)

  const importData = useCallback((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const rows = text.split('\n').filter((row) => row.trim())
      const cells = rows.slice(1).map((row) => {
        const [name = '', price = '0', gencode = ''] = row.split(',').map((val) => val.trim())
        return { name, price, gencode }
      })
      dispatch({ type: 'IMPORT_DATA', payload: cells })
    }
    reader.readAsText(file)
  }, [])

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
    updateObjectColor
  }
}

export default useCellManager
