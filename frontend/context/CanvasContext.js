import React, { createContext, useRef, useContext, useReducer, useEffect } from 'react'
import useCanvasObjectHandler from '../hooks/useCanvasObjectHandler'
import useCanvasTransformAndConstraints from '../hooks/useCanvasTransformAndConstraints'
import useInitializeCanvas from '../hooks/useInitializeCanvas'
import useCanvasObjectActions from '../hooks/useCanvasObjectActions'
import { canvasReducer, initialCanvasState } from '../reducers/canvasReducer'
import { syncGridConfigToLabelConfig } from '../utils/configSync'
import { GridContext } from './GridContext'
import useCanvasGridSync from '../hooks/useCanvasGridSync'
import useCanvasObjectUpdater from '../hooks/useCanvasObjectUpdater'
import useCanvasContextMenu from '../hooks/useCanvasContextMenu'

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

  useCanvasContextMenu(canvas)

  // Gestion des objets sur le canevas
  const { isShapeSelected, isTextSelected, isImageSelected, isQRCodeSelected } =
    useCanvasObjectHandler(canvas, selectedObject, dispatchCanvasAction)

  // Actions pour les objets
  const { onAddCircle, onAddRectangle, onAddText, onAddImage, onAddQrCode, onUpdateQrCode } =
    useCanvasObjectActions(canvas, labelConfig, selectedColor, selectedFont)
  const updateObjectProperties = useCanvasObjectUpdater(canvas, dispatchCanvasAction)

  // Ajout des logs pour surveiller les objets du canevas
  useEffect(() => {
    if (!canvas || process.env.NODE_ENV !== 'development') return

    let isInitialRender = true

    const logObjectChanges = (eventName, obj) => {
      if (isInitialRender) {
        isInitialRender = false
        return
      }

      // Récupérer les dimensions canvas via getScaled
      const canvasWidth = obj?.getScaledWidth?.() || 0
      const canvasHeight = obj?.getScaledHeight?.() || 0

      console.log(`Canvas Event: ${eventName}`, {
        id: obj?.id || 'N/A',
        type: obj?.type || 'unknown',
        left: obj?.left,
        top: obj?.top,
        // Dimensions originales
        originalWidth: obj?.width,
        originalHeight: obj?.height,
        // Dimensions dans le canvas
        canvasWidth,
        canvasHeight,
        // Scales
        scaleX: obj?.scaleX,
        scaleY: obj?.scaleY,
        // Stroke info
        strokeWidth: obj?.strokeWidth,
        strokeUniform: obj?.strokeUniform
      })
    }

    const events = ['object:added', 'object:modified', 'object:removed']
    const handlers = events.reduce((acc, event) => {
      acc[event] = (e) => logObjectChanges(event, e.target)
      return acc
    }, {})

    events.forEach((event) => canvas.on(event, handlers[event]))
    return () => events.forEach((event) => canvas.off(event, handlers[event]))
  }, [canvas])

  useEffect(() => {
    if (!canvas) return

    const handleObjectRemoved = (e) => {
      const obj = e.target
      if (obj?.id) {
        // Dispatch pour supprimer l'objet dans toutes les cellules
        dispatchCanvasAction({
          type: 'DELETE_CLEARED_OBJECT',
          payload: { id: obj.id }
        })
      }
    }

    canvas.on('object:removed', handleObjectRemoved)

    return () => {
      canvas.off('object:removed', handleObjectRemoved)
    }
  }, [canvas, dispatchCanvasAction])

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
    updateObjectProperties,
    canvasState
  }

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
}

export { CanvasContext, CanvasProvider, useCanvas }
