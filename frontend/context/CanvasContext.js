import React, { createContext, useEffect, useRef, useState, useContext } from 'react'
import * as fabric from 'fabric'
import useCanvasObjectHandler from '../hooks/useCanvasObjectHandler'
import useObjectConstraints from '../hooks/useObjectConstraints'
import useAddObjectToCanvas from '../hooks/useAddObjectToCanvas'
import { mmToPx } from '../utils/conversionUtils'
import useCanvasTransform from '../hooks/useCanvasTransform'
const CanvasContext = createContext()

const useCanvas = () => useContext(CanvasContext)

const CanvasProvider = ({ children }) => {
  const canvasRef = useRef(null)
  const [canvas, setCanvas] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  const [labelConfig, setLabelConfig] = useState({
    labelWidth: 48.5,
    labelHeight: 25.5,
    offsetTop: 22,
    offsetLeft: 8,
    spacingVertical: 0,
    spacingHorizontal: 0
  })

  const { updateCanvasSize, handleZoomChange } = useCanvasTransform(
    canvas,
    labelConfig,
    setLabelConfig,
    zoomLevel,
    setZoomLevel
  )

  const [selectedColor, setSelectedColor] = useState('#000000') // Couleur par défaut
  const [selectedObject, setSelectedObject] = useState(null) // Objet sélectionné

  // Initialisation du canevas
  useEffect(() => {
    if (!canvas) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: mmToPx(labelConfig.labelWidth),
        height: mmToPx(labelConfig.labelHeight),
        preserveObjectStacking: true
      })

      // Définir la couleur de fond du canevas
      fabricCanvas.backgroundColor = 'white'
      fabricCanvas.renderAll()

      setCanvas(fabricCanvas)
      console.log('Canvas initialisé :', fabricCanvas)
    } else {
      canvas.setWidth(mmToPx(labelConfig.labelWidth))
      canvas.setHeight(mmToPx(labelConfig.labelHeight))

      canvas.backgroundColor = 'white'
      canvas.renderAll()
    }
  }, [canvas, labelConfig.labelWidth, labelConfig.labelHeight])

  // Gestion des événements du canevas
  useCanvasObjectHandler(canvas, selectedObject, selectedColor, setSelectedObject, setSelectedColor)
  useObjectConstraints(canvas)

  // Fonction pour mettre à jour la couleur sélectionnée via InstanceContext
  const updateSelectedColor = (color) => {
    setSelectedColor(color)
  }

  const { onAddCircle, onAddRectangle, onAddText, onAddImage } = useAddObjectToCanvas(
    canvas,
    labelConfig,
    selectedColor
  )

  const isShapeSelected = () => {
    if (!selectedObject) return false
    return selectedObject.type === 'circle' || selectedObject.type === 'rect'
  }

  const isTextSelected = () => {
    if (!selectedObject) return false
    return selectedObject.type === 'i-text'
  }

  const value = {
    canvasRef,
    canvas,
    zoomLevel,
    setZoomLevel,
    updateCanvasSize,
    handleZoomChange,
    labelConfig,
    setLabelConfig,
    selectedColor,
    setSelectedColor,
    selectedObject,
    setSelectedObject,
    onAddCircle,
    onAddRectangle,
    onAddText,
    onAddImage,
    isShapeSelected,
    isTextSelected,
    updateSelectedColor
  }

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
}

export { CanvasContext, CanvasProvider, useCanvas }
