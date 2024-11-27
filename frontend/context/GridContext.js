import React, { createContext, useReducer, useEffect, useMemo } from 'react'
import { gridReducer, initialGridState } from '../reducers/gridReducer'
import { generateGrid } from '../utils/gridUtils' // Nouveau fichier utilitaire

export const GridContext = createContext()

export const GridProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gridReducer, initialGridState)

  // Charger la grille une seule fois au montage
  useEffect(() => {
    const { grid, cellsPerPage } = generateGrid(state.config, state.totalPages)
    dispatch({
      type: 'INITIALIZE_GRID',
      payload: { grid, cellsPerPage }
    })
  }, [state.config, state.totalPages])

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      findLinkedGroup: (cellId) => state.linkedGroups.find((group) => group.includes(cellId)) || []
    }),
    [state]
  )

  return <GridContext.Provider value={contextValue}>{children}</GridContext.Provider>
}
