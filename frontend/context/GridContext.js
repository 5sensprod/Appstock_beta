//frontend\context\GridContext.js
import React, { createContext, useReducer, useEffect } from 'react'
import { gridReducer, initialGridState } from '../reducers/gridReducer'

export const GridContext = createContext()

export const GridProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gridReducer, initialGridState)

  useEffect(() => {
    dispatch({ type: 'GENERATE_GRID' })
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
