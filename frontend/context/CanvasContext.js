import React, { createContext, useRef, useContext, useReducer, useEffect } from 'react'
import useCanvasObjectHandler from '../hooks/useCanvasObjectHandler'
import useCanvasTransformAndConstraints from '../hooks/useCanvasTransformAndConstraints'
import useInitializeCanvas from '../hooks/useInitializeCanvas'
import useCanvasObjectActions from '../hooks/useCanvasObjectActions'
import { canvasReducer, initialCanvasState } from '../reducers/canvasReducer'
import { syncGridConfigToLabelConfig } from '../utils/configSync'
import { GridContext } from './GridContext'

const CanvasContext = createContext()

const useCanvas = () => {
  const context = useContext(CanvasContext)
  if (!context) throw new Error('useCanvas must be used within a CanvasProvider')
  return context
}

const CanvasProvider = ({ children }) => {
  const canvasRef = useRef(null)
  const [canvasState, dispatchCanvasAction] = useReducer(canvasReducer, initialCanvasState)
  const { state: gridState } = useContext(GridContext) // Récupère `config` depuis `GridContext`
  const { config } = gridState

  // Convertir `config` de GridContext en `labelConfig`
  const labelConfig = syncGridConfigToLabelConfig(config)

  const { canvas, zoomLevel, selectedColor, selectedFont, selectedObject } = canvasState

  // Initialisation du canevas
  useInitializeCanvas(canvas, labelConfig, dispatchCanvasAction, canvasRef)

  // Gestion des transformations et des contraintes
  const { handleZoomChange } = useCanvasTransformAndConstraints(
    canvas,
    labelConfig,
    dispatchCanvasAction
  )

  // Gestion des objets sur le canevas
  const { isShapeSelected, isTextSelected, isImageSelected, isQRCodeSelected } =
    useCanvasObjectHandler(
      canvas,
      selectedObject,
      selectedColor,
      selectedFont,
      dispatchCanvasAction
    )

  // Actions pour les objets
  const {
    onAddCircle,
    onAddRectangle,
    onAddText,
    onAddTextCsv,
    onAddImage,
    onAddQrCode,
    onUpdateQrCode,
    onAddQrCodeCsv
  } = useCanvasObjectActions(canvas, labelConfig, selectedColor, selectedFont)

  useEffect(() => {
    if (canvas && canvasState.zoomLevel !== canvas.getZoom()) {
      canvas.setZoom(canvasState.zoomLevel)
    }
  }, [canvas, canvasState.zoomLevel])

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
    onAddTextCsv,
    onAddImage,
    onAddQrCode,
    onAddQrCodeCsv,
    onUpdateQrCode,
    // Vérifications du type d'objet
    isShapeSelected,
    isTextSelected,
    isImageSelected,
    isQRCodeSelected,
    // Dispatcher pour des actions personnalisées
    dispatchCanvasAction,
    canvasState
  }

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
}

export { CanvasContext, CanvasProvider, useCanvas }
