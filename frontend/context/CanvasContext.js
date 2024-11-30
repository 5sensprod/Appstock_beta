import React, { createContext, useRef, useContext, useReducer, useEffect } from 'react'
import useCanvasObjectHandler from '../hooks/useCanvasObjectHandler'
import useCanvasTransformAndConstraints from '../hooks/useCanvasTransformAndConstraints'
import useInitializeCanvas from '../hooks/useInitializeCanvas'
import useCanvasObjectActions from '../hooks/useCanvasObjectActions'
import { canvasReducer, initialCanvasState } from '../reducers/canvasReducer'
import { syncGridConfigToLabelConfig } from '../utils/configSync'
import { GridContext } from './GridContext'
import useCanvasGridSync from '../hooks/useCanvasGridSync'
import useCanvasSerialization from '../hooks/useCanvasSerialization'
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
    canvasState,
    dispatchCanvasAction
  )

  // Gestion des objets sur le canevas
  const { isShapeSelected, isTextSelected, isImageSelected, isQRCodeSelected } =
    useCanvasObjectHandler(canvas, selectedObject, dispatchCanvasAction)

  // Actions pour les objets
  const { onAddCircle, onAddRectangle, onAddText, onAddImage, onAddQrCode, onUpdateQrCode } =
    useCanvasObjectActions(canvas, labelConfig, selectedColor, selectedFont)

  // Ajout des logs pour surveiller les objets du canevas
  useEffect(() => {
    if (!canvas) return

    const logObjectChanges = (eventName, obj) => {
      console.log(`Canvas Event: ${eventName}`, {
        id: obj?.id || 'N/A',
        isQRCode: obj?.isQRCode || 'N/A',
        qrText: obj?.qrText || 'N/A',
        type: obj?.type || 'unknown',
        left: obj?.left,
        top: obj?.top,
        fill: obj?.fill || 'N/A',
        fontFamily: obj?.fontFamily || 'N/A'
      })
    }

    const handleObjectAdded = (e) => logObjectChanges('object:added', e.target)
    const handleObjectModified = (e) => logObjectChanges('object:modified', e.target)
    const handleObjectRemoved = (e) => logObjectChanges('object:removed', e.target)

    canvas.on('object:added', handleObjectAdded)
    canvas.on('object:modified', handleObjectModified)
    canvas.on('object:removed', handleObjectRemoved)

    return () => {
      canvas.off('object:added', handleObjectAdded)
      canvas.off('object:modified', handleObjectModified)
      canvas.off('object:removed', handleObjectRemoved)
    }
  }, [canvas])

  const { handleCanvasModification } = useCanvasGridSync(canvas)
  const { saveCanvasState, loadCanvasState } = useCanvasSerialization(canvas, dispatchCanvasAction)

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
    saveCanvasState, // Expose les fonctions du hook
    loadCanvasState,
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
