import React, { createContext, useEffect, useRef, useContext, useReducer, useCallback } from 'react'
import * as fabric from 'fabric'
import useCanvasObjectHandler from '../hooks/useCanvasObjectHandler'
import useObjectConstraints from '../hooks/useObjectConstraints'
import useAddObjectToCanvas from '../hooks/useAddObjectToCanvas'
import { mmToPx } from '../utils/conversionUtils'
import useCanvasTransform from '../hooks/useCanvasTransform'
import { canvasReducer, initialCanvasState } from '../reducers/canvasReducer'
import FontFaceObserver from 'fontfaceobserver'
import useAddShape from '../hooks/useAddShape'
import useAddText from '../hooks/useAddText'
import useAddImage from '../hooks/useAddImage'
import useAddQRCode from '../hooks/useAddQRCode'

// Création du contexte pour le canevas
const CanvasContext = createContext()

// Hook pour accéder au contexte facilement
const useCanvas = () => {
  const context = useContext(CanvasContext)
  if (!context) throw new Error('useCanvas must be used within a CanvasProvider')
  return context
}

const CanvasProvider = ({ children }) => {
  const canvasRef = useRef(null) // Référence au canevas dans le DOM
  const [state, dispatch] = useReducer(canvasReducer, initialCanvasState)

  const { canvas, zoomLevel, selectedColor, selectedFont, selectedObject, labelConfig } = state

  // Hook pour gérer la taille et le zoom du canevas
  const { updateCanvasSize, handleZoomChange } = useCanvasTransform(canvas, labelConfig, dispatch)

  // Initialisation du canevas
  useEffect(() => {
    if (!canvas) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: mmToPx(labelConfig.labelWidth),
        height: mmToPx(labelConfig.labelHeight),
        preserveObjectStacking: true
      })

      fabricCanvas.backgroundColor = 'white'
      fabricCanvas.renderAll()
      dispatch({ type: 'SET_CANVAS', payload: fabricCanvas })
    } else {
      // Met à jour les dimensions si le canevas est déjà défini
      canvas.setWidth(mmToPx(labelConfig.labelWidth))
      canvas.setHeight(mmToPx(labelConfig.labelHeight))
      canvas.backgroundColor = 'white'
      canvas.renderAll()
    }
  }, [canvas, labelConfig.labelWidth, labelConfig.labelHeight])

  // Utilise les hooks de gestion d'objets du canevas
  useCanvasObjectHandler(canvas, selectedObject, selectedColor, selectedFont, dispatch)
  useObjectConstraints(canvas)

  // Hooks pour ajouter différents types d'objets
  const { addObjectToCanvas, onDeleteObject } = useAddObjectToCanvas(canvas, labelConfig)
  const { onAddCircle, onAddRectangle } = useAddShape(
    canvas,
    labelConfig,
    selectedColor,
    addObjectToCanvas
  )
  const { onAddText, onAddTextCsv } = useAddText(
    canvas,
    labelConfig,
    selectedColor,
    selectedFont,
    addObjectToCanvas
  )
  const onAddImage = useAddImage(canvas, labelConfig, addObjectToCanvas)
  const { onAddQrCode, onUpdateQrCode, onAddQrCodeCsv } = useAddQRCode(
    canvas,
    labelConfig,
    selectedColor,
    addObjectToCanvas
  )

  // Fonctions de vérification de type d'objet
  const isShapeSelected = () => selectedObject?.type === 'circle' || selectedObject?.type === 'rect'
  const isTextSelected = () =>
    selectedObject?.type === 'i-text' || selectedObject?.type === 'textbox'
  const isImageSelected = () => selectedObject?.type === 'image'
  const isQRCodeSelected = useCallback(() => selectedObject?.isQRCode === true, [selectedObject])

  // Gestion de la suppression d'objet avec la touche "Delete"
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete') onDeleteObject()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onDeleteObject])

  // Mise à jour de la configuration du label
  const setLabelConfig = (config) => dispatch({ type: 'SET_LABEL_CONFIG', payload: config })

  // Application de la police à l'objet sélectionné
  useEffect(() => {
    const applyFontToSelectedObject = async () => {
      if (canvas && selectedObject && ['i-text', 'textbox'].includes(selectedObject.type)) {
        const fontObserver = new FontFaceObserver(selectedFont)
        try {
          await fontObserver.load()
          selectedObject.set('fontFamily', selectedFont)
          selectedObject.dirty = true
          selectedObject.setCoords()
          canvas.requestRenderAll()
        } catch (error) {
          console.error(`Erreur lors du chargement de la police ${selectedFont}:`, error)
        }
      }
    }
    applyFontToSelectedObject()
  }, [selectedFont, canvas, selectedObject])

  // Valeurs à exposer dans le contexte
  const value = {
    canvasRef,
    canvas,
    zoomLevel,
    updateCanvasSize,
    handleZoomChange,
    labelConfig,
    setLabelConfig,
    selectedColor,
    setSelectedColor: (color) => dispatch({ type: 'SET_COLOR', payload: color }),
    selectedObject,
    setSelectedObject: (obj) => dispatch({ type: 'SET_SELECTED_OBJECT', payload: obj }),
    selectedFont,
    setSelectedFont: (font) => dispatch({ type: 'SET_FONT', payload: font }),
    onAddCircle,
    onAddRectangle,
    onAddText,
    onAddTextCsv,
    onAddImage,
    onAddQrCode,
    onAddQrCodeCsv,
    onUpdateQrCode,
    onDeleteObject,
    isShapeSelected,
    isTextSelected,
    isImageSelected,
    isQRCodeSelected,
    dispatch
  }

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
}

export { CanvasContext, CanvasProvider, useCanvas }
