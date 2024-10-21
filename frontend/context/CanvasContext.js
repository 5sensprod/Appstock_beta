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

  const [selectedColor, setSelectedColor] = useState('#000000') // Couleur sélectionnée
  const [selectedObject, setSelectedObject] = useState(null) // Objet sélectionné

  // Initialisation du canevas
  useEffect(() => {
    if (!canvas) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: mmToPx(labelConfig.labelWidth),
        height: mmToPx(labelConfig.labelHeight),
        preserveObjectStacking: true
      })
      setCanvas(fabricCanvas)
      console.log('Canvas initialisé :', fabricCanvas) // Vérification du canvas
    } else {
      canvas.setWidth(mmToPx(labelConfig.labelWidth))
      canvas.setHeight(mmToPx(labelConfig.labelHeight))
      canvas.renderAll()
    }
  }, [canvas, labelConfig.labelWidth, labelConfig.labelHeight])

  useCanvasEvents(canvas, setSelectedObject, setSelectedColor)
  useSelectedObject(canvas, selectedObject, selectedColor)
  useObjectConstraints(canvas)

  const addObjectToCanvas = (object) => {
    if (canvas) {
      const centerX = mmToPx(labelConfig.labelWidth / 2) // Centre du canevas (X)
      const centerY = mmToPx(labelConfig.labelHeight / 2) // Centre du canevas (Y)

      // Positionner l'objet au centre
      object.set({
        left: centerX - (object.width || 0) / 2, // Centrer horizontalement
        top: centerY - (object.height || 0) / 2 // Centrer verticalement
      })

      // Ajouter l'objet au canevas
      canvas.add(object)

      // Sélectionner l'objet ajouté
      canvas.setActiveObject(object) // Rendre l'objet actif pour être sélectionné

      // Redessiner le canevas pour mettre à jour l'affichage
      canvas.renderAll()
    }
  }

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

  const onAddText = () => {
    const fontSize = labelConfig.labelWidth / 5
    const text = new fabric.IText('Votre texte ici', {
      fontSize: fontSize,
      fill: selectedColor // Utiliser la couleur sélectionnée
    })

    addObjectToCanvas(text)
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
    onAddText
  }

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
}

export { CanvasContext, CanvasProvider, useCanvas }
