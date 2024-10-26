import React, { createContext, useEffect, useRef, useContext, useReducer, useCallback } from 'react'
import * as fabric from 'fabric'
import useCanvasObjectHandler from '../hooks/useCanvasObjectHandler'
import useObjectConstraints from '../hooks/useObjectConstraints'
import useAddObjectToCanvas from '../hooks/useAddObjectToCanvas'
import { mmToPx } from '../utils/conversionUtils'
import useCanvasTransform from '../hooks/useCanvasTransform'
import { canvasReducer, initialCanvasState } from '../reducers/canvasReducer'

import useAddShape from '../hooks/useAddShape'
import useAddText from '../hooks/useAddText'
import useAddImage from '../hooks/useAddImage'
import useAddQRCode from '../hooks/useAddQRCode'

const CanvasContext = createContext()

const useCanvas = () => useContext(CanvasContext)

const CanvasProvider = ({ children }) => {
  const canvasRef = useRef(null)
  const [state, dispatch] = useReducer(canvasReducer, initialCanvasState)

  const { canvas, zoomLevel, selectedColor, selectedFont, selectedObject, labelConfig } = state

  const { updateCanvasSize, handleZoomChange } = useCanvasTransform(
    canvas,
    labelConfig,
    (config) => dispatch({ type: 'SET_LABEL_CONFIG', payload: config }),
    zoomLevel,
    (zoom) => dispatch({ type: 'SET_ZOOM', payload: zoom })
  )

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
      console.log('Canvas initialisé :', fabricCanvas)
    } else {
      canvas.setWidth(mmToPx(labelConfig.labelWidth))
      canvas.setHeight(mmToPx(labelConfig.labelHeight))
      canvas.backgroundColor = 'white'
      canvas.renderAll()
    }
  }, [canvas, labelConfig.labelWidth, labelConfig.labelHeight])

  // Gestion des événements du canevas
  useCanvasObjectHandler(canvas, selectedObject, selectedColor, selectedFont, dispatch)
  useObjectConstraints(canvas)

  // Utilisation des hooks pour ajouter différents objets
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

  useEffect(() => {
    if (
      canvas &&
      selectedObject &&
      (selectedObject.type === 'i-text' || selectedObject.type === 'textbox')
    ) {
      selectedObject.set('fontFamily', selectedFont)
      canvas.renderAll() // Force le rendu pour appliquer la police sélectionnée
    }
  }, [selectedFont, canvas, selectedObject])

  const isShapeSelected = () => {
    if (!selectedObject) return false
    return selectedObject.type === 'circle' || selectedObject.type === 'rect'
  }

  const isTextSelected = () => {
    if (!selectedObject) return false
    return selectedObject.type === 'i-text' || selectedObject.type === 'textbox'
  }

  const isImageSelected = () => {
    if (!selectedObject) return false
    return selectedObject.type === 'image'
  }

  const isQRCodeSelected = useCallback(() => {
    if (!selectedObject) return false
    return selectedObject.isQRCode === true
  }, [selectedObject])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete') {
        onDeleteObject() // Utiliser la fonction onDeleteObject existante
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onDeleteObject])

  const setLabelConfig = (config) => {
    dispatch({
      type: 'SET_LABEL_CONFIG',
      payload: config
    })
  }

  const value = {
    canvasRef,
    canvas,
    zoomLevel,
    setZoomLevel: (zoom) => dispatch({ type: 'SET_ZOOM', payload: zoom }),
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

    // Fonctions pour ajouter des objets
    onAddCircle,
    onAddRectangle,
    onAddText,
    onAddTextCsv,
    onAddImage,
    onAddQrCode,
    onAddQrCodeCsv,
    onUpdateQrCode,

    // Fonctions et vérifications d'état
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
