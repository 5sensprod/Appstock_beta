// frontend/context/LabelContext.js
import React, { createContext, useContext, useReducer } from 'react'
import { cellReducer, initialCellState } from '../reducers/cellReducer'
import { dataReducer, initialDataState } from '../reducers/dataReducer'
import { CanvasProvider } from './CanvasContext'

// Création du LabelContext
const LabelContext = createContext()

// Provider pour LabelContext
export const LabelProvider = ({ children }) => {
  // Initialiser les reducers pour les cellules et les données
  const [cellState, cellDispatch] = useReducer(cellReducer, initialCellState)
  const [dataState, dataDispatch] = useReducer(dataReducer, initialDataState)

  // Regrouper les états et dispatchers pour les fournir aux composants
  const value = {
    cells: { state: cellState, dispatch: cellDispatch },
    data: { state: dataState, dispatch: dataDispatch }
  }

  return (
    <LabelContext.Provider value={value}>
      <CanvasProvider>{children}</CanvasProvider>
    </LabelContext.Provider>
  )
}

// Hook pour utiliser LabelContext facilement dans les composants
export const useLabelContext = () => useContext(LabelContext)
