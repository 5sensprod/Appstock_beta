import React, { createContext, useEffect, useRef, useState, useContext } from 'react'
import * as fabric from 'fabric'
import useCanvasObjectHandler from '../hooks/useCanvasObjectHandler'
import useObjectConstraints from '../hooks/useObjectConstraints'
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

  const addObjectToCanvas = (object) => {
    if (canvas) {
      const centerX = mmToPx(labelConfig.labelWidth / 2)
      const centerY = mmToPx(labelConfig.labelHeight / 2)

      object.set({
        left: centerX - (object.width || 0) / 2,
        top: centerY - (object.height || 0) / 2
      })

      canvas.add(object)
      canvas.setActiveObject(object)
      canvas.renderAll()
    }
  }

  // Fonction pour mettre à jour la couleur sélectionnée via InstanceContext
  const updateSelectedColor = (color) => {
    setSelectedColor(color)
  }

  // Méthode pour ajouter un cercle
  const onAddCircle = () => {
    const minDimension = Math.min(labelConfig.labelWidth, labelConfig.labelHeight)
    const circleRadius = minDimension / 2.5

    const circle = new fabric.Circle({
      radius: circleRadius,
      fill: selectedColor, // Utiliser la couleur sélectionnée
      stroke: '#aaf',
      strokeWidth: 2,
      strokeUniform: true
    })

    addObjectToCanvas(circle)
  }

  // Méthode pour ajouter un rectangle
  const onAddRectangle = () => {
    const rectWidth = labelConfig.labelWidth / 1.1
    const rectHeight = labelConfig.labelHeight / 1.1
    const rectangle = new fabric.Rect({
      width: rectWidth,
      height: rectHeight,
      fill: selectedColor // Utiliser la couleur sélectionnée
    })

    addObjectToCanvas(rectangle)
  }

  // Méthode pour ajouter du texte
  const onAddText = () => {
    const fontSize = labelConfig.labelWidth / 5
    const text = new fabric.IText('Votre texte ici', {
      fontSize: fontSize,
      fill: selectedColor // Utiliser la couleur sélectionnée
    })

    addObjectToCanvas(text)
  }

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
    isShapeSelected,
    isTextSelected,
    updateSelectedColor
  }

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
}

export { CanvasContext, CanvasProvider, useCanvas }
