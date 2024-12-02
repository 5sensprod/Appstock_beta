import React, { createContext, useReducer, useEffect, useMemo, useState } from 'react'
import { gridReducer, initialGridState } from '../reducers/gridReducer'
import { generateGrid } from '../utils/gridUtils'

export const GridContext = createContext()

export const GridProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gridReducer, initialGridState)
  const [importInProgress, setImportInProgress] = useState(false)

  useEffect(() => {
    const { grid, cellsPerPage } = generateGrid(state.config, state.totalPages)

    dispatch({
      type: 'INITIALIZE_GRID',
      payload: {
        grid,
        cellsPerPage,
        totalPages: state.totalPages,
        selectedCellId: importInProgress ? null : grid[0]?.id // Désactiver si import
      }
    })
  }, [state.config, state.totalPages, importInProgress])

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      importInProgress, // Exposez l'état pour d'autres composants si nécessaire
      setImportInProgress,
      findLinkedGroup: (cellId) => state.linkedGroups.find((group) => group.includes(cellId)) || []
    }),
    [state, importInProgress]
  )

  return <GridContext.Provider value={contextValue}>{children}</GridContext.Provider>
}
