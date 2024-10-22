import React, { createContext, useEffect, useRef, useState, useContext } from 'react'
import * as fabric from 'fabric'
import useCanvasZoom from '../hooks/useCanvasZoom'
import useUpdateCanvasSize from '../hooks/useUpdateCanvasSize'
import useCanvasEvents from '../hooks/useCanvasEvents'
import useSelectedObject from '../hooks/useSelectedObject'
import useObjectConstraints from '../hooks/useObjectConstraints'

const CanvasContext = createContext()

const useCanvas = () => useContext(CanvasContext)

const mmToPx = (mm) => (mm / 25.4) * 72

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

  const updateCanvasSize = useUpdateCanvasSize(canvas, labelConfig, setLabelConfig, setZoomLevel)
  const handleZoomChange = useCanvasZoom(canvas, zoomLevel, setZoomLevel)

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

      // Définir la couleur de fond du canvas via Fabric.js
      fabricCanvas.backgroundColor = 'white'
      fabricCanvas.renderAll() // Rendre le canevas avec le fond appliqué

      setCanvas(fabricCanvas)
      console.log('Canvas initialisé :', fabricCanvas)
    } else {
      canvas.setWidth(mmToPx(labelConfig.labelWidth))
      canvas.setHeight(mmToPx(labelConfig.labelHeight))

      // Redéfinir le fond à chaque fois que le canevas est réinitialisé
      canvas.backgroundColor = 'white'
      canvas.renderAll() // Rendre le canevas avec le fond appliqué

      canvas.renderAll()
    }
  }, [canvas, labelConfig.labelWidth, labelConfig.labelHeight])

  // Gestion des événements du canevas
  useCanvasEvents(canvas, setSelectedObject, setSelectedColor)
  useSelectedObject(canvas, selectedObject, selectedColor)
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
    isShapeSelected, // Expose cette fonction
    isTextSelected,
    updateSelectedColor
  }

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
}

export { CanvasContext, CanvasProvider, useCanvas }
