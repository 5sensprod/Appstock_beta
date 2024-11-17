import React, { createContext, useReducer, useEffect } from 'react'
import { gridReducer, initialGridState } from '../reducers/gridReducer'

export const GridContext = createContext()

export const GridProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gridReducer, initialGridState)

  // Generate the grid on initialization
  useEffect(() => {
    dispatch({ type: 'GENERATE_GRID' })

    // Simuler des données pour quelques cellules
    dispatch({
      type: 'UPDATE_CELL_CONTENT',
      payload: { id: '0-0', content: '{Nom: Produit 1}' }
    })
    dispatch({
      type: 'UPDATE_CELL_CONTENT',
      payload: { id: '0-1', content: '{Tarif: 19.99}' }
    })
    dispatch({
      type: 'UPDATE_CELL_CONTENT',
      payload: { id: '1-0', content: '{Gencode: 123456789012}' }
    })
  }, []) // Vide pour ne s'exécuter qu'au démarrage

  return <GridContext.Provider value={{ state, dispatch }}>{children}</GridContext.Provider>
}
