// contexts/StyleContext.js
import React, { createContext, useContext } from 'react'
import { useStrokeManager } from '../hooks/useStrokeManager'
import { useAppearanceManager } from '../hooks/useAppearanceManager'
const StyleContext = createContext()

export const useStyle = () => {
  const context = useContext(StyleContext)
  if (!context) {
    throw new Error('useStyle doit être utilisé dans un StyleProvider')
  }
  return context
}

export const StyleProvider = ({ children }) => {
  const strokeManager = useStrokeManager()
  const {
    currentOpacity,
    currentGradientType,
    currentGradientColors,
    currentGradientDirection,
    currentGradientOffsets,
    currentColor,
    handleOpacityChange,
    createGradient,
    removeGradient
  } = useAppearanceManager()

  const value = {
    // Stroke properties
    currentStroke: strokeManager.currentStroke,
    currentStrokeWidth: strokeManager.currentStrokeWidth,
    currentPatternType: strokeManager.currentPatternType,
    currentPatternDensity: strokeManager.currentPatternDensity,
    handleStrokeChange: strokeManager.handleStrokeChange,

    // Appearance properties
    currentOpacity,
    currentGradientType,
    currentGradientColors,
    currentGradientDirection,
    currentGradientOffsets,
    currentColor,
    handleOpacityChange,
    createGradient,
    removeGradient
  }

  return <StyleContext.Provider value={value}>{children}</StyleContext.Provider>
}
