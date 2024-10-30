import React, { createContext, useRef, useContext, useReducer } from 'react'
import useCanvasObjectHandler from '../hooks/useCanvasObjectHandler'
import useObjectConstraints from '../hooks/useObjectConstraints'
import useCanvasTransform from '../hooks/useCanvasTransform'
import { canvasReducer, initialCanvasState } from '../reducers/canvasReducer'
import useInitializeCanvas from '../hooks/useInitializeCanvas'
import useCanvasObjectManagement from '../hooks/useCanvasObjectManagement'
import useFontManagement from '../hooks/useFontManagement'
import useCanvasObjectActions from '../hooks/useCanvasObjectActions' // Import du nouveau hook

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

  // Initialisation et transformations du canevas
  useInitializeCanvas(canvas, labelConfig, dispatchCanvasAction, canvasRef)
  const { updateCanvasSize, handleZoomChange } = useCanvasTransform(
    canvas,
    labelConfig,
    dispatchCanvasAction
  )

  // Gestion des objets sur le canevas
  useCanvasObjectHandler(canvas, selectedObject, selectedColor, selectedFont, dispatchCanvasAction)
  useObjectConstraints(canvas)

  // Utilisation de useCanvasObjectActions pour gérer l'ajout/suppression d'objets
  const {
    // addObjectToCanvas,
    onDeleteObject,
    onAddCircle,
    onAddRectangle,
    onAddText,
    onAddTextCsv,
    onAddImage,
    onAddQrCode,
    onUpdateQrCode,
    onAddQrCodeCsv
  } = useCanvasObjectActions(canvas, labelConfig, selectedColor, selectedFont)

  // Vérifications de type d'objet et gestion de la touche "Delete"
  const { isShapeSelected, isTextSelected, isImageSelected, isQRCodeSelected } =
    useCanvasObjectManagement(canvas, selectedObject, onDeleteObject)

  // Gestion de la police de l'objet sélectionné
  useFontManagement(canvas, selectedObject, selectedFont)

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
    // Actions centralisées pour les objets
    onAddCircle,
    onAddRectangle,
    onAddText,
    onAddTextCsv,
    onAddImage,
    onAddQrCode,
    onAddQrCodeCsv,
    onUpdateQrCode,
    onDeleteObject,
    // Vérifications de type d'objet
    isShapeSelected,
    isTextSelected,
    isImageSelected,
    isQRCodeSelected,
    dispatchCanvasAction,
    canvasState
  }

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
}

export { CanvasContext, CanvasProvider, useCanvas }
