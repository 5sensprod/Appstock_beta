import React, { createContext, useEffect, useRef, useState, useContext } from 'react'
import * as fabric from 'fabric'
import useCanvasZoom from '../hooks/useCanvasZoom'
import useUpdateCanvasSize from '../hooks/useUpdateCanvasSize'
import useCanvasEvents from '../hooks/useCanvasEvents'
import useSelectedObject from '../hooks/useSelectedObject'

const CanvasContext = createContext()

// Hook personnalisé pour utiliser le contexte facilement
const useCanvas = () => useContext(CanvasContext)

// Conversion millimètres en pixels
const mmToPx = (mm) => (mm / 25.4) * 72

const CanvasProvider = ({ children }) => {
  const canvasRef = useRef(null)
  const [canvas, setCanvas] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  // Configuration des labels (la source de vérité est en millimètres)
  const [labelConfig, setLabelConfig] = useState({
    labelWidth: 48.5, // Largeur par défaut en mm
    labelHeight: 25.5, // Hauteur par défaut en mm
    offsetTop: 22,
    offsetLeft: 8,
    spacingVertical: 0,
    spacingHorizontal: 0
  })

  const updateCanvasSize = useUpdateCanvasSize(
    canvas,
    labelConfig,
    zoomLevel,
    setZoomLevel,
    setLabelConfig
  )

  const handleZoomChange = useCanvasZoom(canvas, zoomLevel, setZoomLevel, labelConfig)

  const [selectedColor, setSelectedColor] = useState('#000000') // Couleur sélectionnée par l'utilisateur
  const [selectedObject, setSelectedObject] = useState(null) // Objet sélectionné sur le canevas

  // Initialisation du canevas
  useEffect(() => {
    if (!canvas) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: mmToPx(labelConfig.labelWidth),
        height: mmToPx(labelConfig.labelHeight),
        preserveObjectStacking: true
      })
      setCanvas(fabricCanvas)
    } else {
      canvas.setWidth(mmToPx(labelConfig.labelWidth))
      canvas.setHeight(mmToPx(labelConfig.labelHeight))
      canvas.renderAll()
    }
  }, [canvas, labelConfig.labelWidth, labelConfig.labelHeight])

  // Gestion des événements du canevas (sélection, mouvement, redimensionnement)
  useCanvasEvents(canvas, setSelectedObject, setSelectedColor)

  // Mise à jour de la couleur de l'objet sélectionné
  useSelectedObject(canvas, selectedObject, selectedColor)

  // Fonction utilitaire pour la mise à l'échelle et le positionnement
  const scaleAndPositionObject = (object, zoomLevel) => {
    object.scaleX = object.scaleX * zoomLevel
    object.scaleY = object.scaleY * zoomLevel
    object.left = object.left * zoomLevel
    object.top = object.top * zoomLevel
    object.setCoords() // Met à jour les coordonnées après redimensionnement
  }

  const addObjectToCanvas = (object) => {
    if (canvas) {
      const centerX = mmToPx(labelConfig.labelWidth / 2) // Centre du canevas (X)
      const centerY = mmToPx(labelConfig.labelHeight / 2) // Centre du canevas (Y)

      // Positionner l'objet au centre du canevas
      object.set({
        left: centerX - (object.width || 0) / 2, // Centrer horizontalement
        top: centerY - (object.height || 0) / 2 // Centrer verticalement
      })

      // Ajouter l'objet au canevas
      canvas.add(object)

      // Appliquer le zoom
      scaleAndPositionObject(object, zoomLevel)

      // Sélectionner automatiquement l'objet ajouté
      canvas.setActiveObject(object)

      // Redessiner le canevas
      canvas.renderAll()
    }
  }

  const onAddCircle = () => {
    const minDimension = Math.min(labelConfig.labelWidth, labelConfig.labelHeight)

    const circleRadius = minDimension / 2.5

    const circle = new fabric.Circle({
      radius: circleRadius,
      fill: 'blue',
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
      fill: 'green'
    })

    addObjectToCanvas(rectangle)
  }

  const onAddText = () => {
    const fontSize = labelConfig.labelWidth / 5
    const text = new fabric.IText('Votre texte ici', {
      fontSize: fontSize,
      fill: selectedColor
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
