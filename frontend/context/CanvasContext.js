import React, { createContext, useRef, useContext, useReducer } from 'react'
import useCanvasObjectHandler from '../hooks/useCanvasObjectHandler'
import useCanvasTransformAndConstraints from '../hooks/useCanvasTransformAndConstraints'
import useInitializeCanvas from '../hooks/useInitializeCanvas'
import useCanvasObjectActions from '../hooks/useCanvasObjectActions'
import { canvasReducer, initialCanvasState } from '../reducers/canvasReducer'

const CanvasContext = createContext()

const useCanvas = () => {
  const context = useContext(CanvasContext)
  if (!context) throw new Error('useCanvas must be used within a CanvasProvider')
  return context
}

const CanvasProvider = ({ children }) => {
  const canvasRef = useRef(null)
  const [canvasState, dispatchCanvasAction] = useReducer(canvasReducer, initialCanvasState)

  const { canvas, zoomLevel, selectedColor, selectedFont, selectedObject, labelConfig } =
    canvasState

  // Initialisation du canevas
  useInitializeCanvas(canvas, labelConfig, dispatchCanvasAction, canvasRef)

  // Gestion des transformations et des contraintes
  const { updateCanvasSize, handleZoomChange } = useCanvasTransformAndConstraints(
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

  // Valeurs et actions exposées par le contexte
  const value = {
    canvasRef,
    canvas,
    zoomLevel,
    updateCanvasSize,
    handleZoomChange,
    labelConfig,
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
