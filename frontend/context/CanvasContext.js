import React, { createContext, useRef, useContext, useReducer } from 'react'
import useCanvasObjectHandler from '../hooks/useCanvasObjectHandler'
import useCanvasTransformAndConstraints from '../hooks/useCanvasTransformAndConstraints'
import useInitializeCanvas from '../hooks/useInitializeCanvas'
import useCanvasObjectActions from '../hooks/useCanvasObjectActions'
import { canvasReducer, initialCanvasState } from '../reducers/canvasReducer'
import { syncGridConfigToLabelConfig } from '../utils/configSync'
import { GridContext } from './GridContext'
import useCanvasGridSync from '../hooks/useCanvasGridSync'

const CanvasContext = createContext()

const useCanvas = () => {
  const context = useContext(CanvasContext)
  if (!context) throw new Error('useCanvas must be used within a CanvasProvider')
  return context
}

const CanvasProvider = ({ children }) => {
  const canvasRef = useRef(null)
  const [canvasState, dispatchCanvasAction] = useReducer(canvasReducer, initialCanvasState)
  const { state: gridState } = useContext(GridContext)

  // Convertir `config` de GridContext en `labelConfig`
  const labelConfig = syncGridConfigToLabelConfig(gridState.config)

  const { canvas, zoomLevel, selectedColor, selectedFont, selectedObject } = canvasState

  // Initialisation du canevas
  useInitializeCanvas(canvas, dispatchCanvasAction, canvasRef)

  // Synchronisation entre Canvas et Grid
  // const { handleCanvasModification } = useCanvasGridSync(canvas)

  // Gestion des transformations et des contraintes
  const { handleZoomChange } = useCanvasTransformAndConstraints(
    canvas,
    labelConfig,
    canvasState,
    dispatchCanvasAction
  )

  // Gestion des objets sur le canevas
  const { isShapeSelected, isTextSelected, isImageSelected, isQRCodeSelected } =
    useCanvasObjectHandler(canvas, selectedObject, dispatchCanvasAction)

  // Actions pour les objets
  const { onAddCircle, onAddRectangle, onAddText, onAddImage, onAddQrCode, onUpdateQrCode } =
    useCanvasObjectActions(canvas, labelConfig, selectedColor, selectedFont)

  const { handleCanvasModification } = useCanvasGridSync(canvas)

  // Valeurs et actions exposées par le contexte
  const value = {
    canvasRef,
    canvas,
    zoomLevel,
    handleZoomChange,
    labelConfig, // Synchronisé avec GridContext via syncGridConfigToLabelConfig
    setLabelConfig: (config) => dispatchCanvasAction({ type: 'SET_LABEL_CONFIG', payload: config }),
    selectedColor,
    setSelectedColor: (color) => dispatchCanvasAction({ type: 'SET_COLOR', payload: color }),
    selectedObject,
    setSelectedObject: (obj) => dispatchCanvasAction({ type: 'SET_SELECTED_OBJECT', payload: obj }),
    selectedFont,
    setSelectedFont: (font) => dispatchCanvasAction({ type: 'SET_FONT', payload: font }),
    // Actions pour les objets
    onAddCircle,
    onAddRectangle,
    onAddText,
    onAddImage,
    onAddQrCode,
    onUpdateQrCode,
    // Vérifications du type d'objet
    isShapeSelected,
    isTextSelected,
    isImageSelected,
    isQRCodeSelected,
    // Dispatcher pour des actions personnalisées
    dispatchCanvasAction,
    handleCanvasModification,
    canvasState
  }

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
}

export { CanvasContext, CanvasProvider, useCanvas }
