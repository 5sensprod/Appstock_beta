// contexts/StyleContext.js
import React, { createContext, useContext } from 'react'
import { useStrokeManager } from '../hooks/useStrokeManager'

const StyleContext = createContext()

export const useStyle = () => {
  const context = useContext(StyleContext)
  if (!context) {
    throw new Error('useStyle doit être utilisé dans un StyleProvider')
  }
  return context
}

export const StyleProvider = ({ children }) => {
  // On utilise directement useStrokeManager sans modifier sa logique
  const strokeManager = useStrokeManager()

  const value = {
    ...strokeManager,
    currentStroke: strokeManager.currentStroke,
    currentStrokeWidth: strokeManager.currentStrokeWidth,
    currentPatternType: strokeManager.currentPatternType,
    currentPatternDensity: strokeManager.currentPatternDensity,
    handleStrokeChange: strokeManager.handleStrokeChange
  }

  return <StyleContext.Provider value={value}>{children}</StyleContext.Provider>
}
