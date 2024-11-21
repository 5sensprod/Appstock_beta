//frontend\context\GridContext.js
import React, { createContext, useReducer, useEffect } from 'react'
import { gridReducer, initialGridState } from '../reducers/gridReducer'

export const GridContext = createContext()

export const GridProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gridReducer, initialGridState)

  useEffect(() => {
    // Une seule action peut regrouper plusieurs opérations initiales
    dispatch({ type: 'GENERATE_GRID' })
    dispatch({ type: 'SELECT_FIRST_CELL' })
  }, [])

  // Trouver le groupe lié d'une cellule
  const findLinkedGroup = (cellId) => {
    return state.linkedGroups.find((group) => group.includes(cellId)) || []
  }

  return (
    <GridContext.Provider value={{ state, dispatch, findLinkedGroup }}>
      {children}
    </GridContext.Provider>
  )
}
