// frontend/context/GridContext.js

import React, { createContext, useContext, useReducer } from 'react'
import { gridReducer, initialGridState } from '../reducers/gridReducer'

const GridContext = createContext()

export const useGrid = () => {
  const context = useContext(GridContext)
  if (!context) throw new Error('useGrid must be used within a GridProvider')
  return context
}

export const GridProvider = ({ children }) => {
  const [gridState, dispatchGridAction] = useReducer(gridReducer, initialGridState)

  console.log('État initial de la grille:', gridState)

  const value = {
    gridState,
    dispatchGridAction
  }

  return <GridContext.Provider value={value}>{children}</GridContext.Provider>
}
