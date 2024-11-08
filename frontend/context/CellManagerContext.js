// context/CellManagerContext.js

import React, { createContext, useContext } from 'react'
import useCellManager from '../hooks/useCellManager'

const CellManagerContext = createContext()

export const CellManagerProvider = ({ children }) => {
  const cellManager = useCellManager()

  return <CellManagerContext.Provider value={cellManager}>{children}</CellManagerContext.Provider>
}

export const useCellManagerContext = () => {
  return useContext(CellManagerContext)
}
