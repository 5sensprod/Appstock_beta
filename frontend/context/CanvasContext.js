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

  // Utiliser le hook de mise à jour de la taille du canevas
  const updateCanvasSize = useUpdateCanvasSize(canvas, labelConfig, setLabelConfig, setZoomLevel)

  // Gestion du zoom avec le hook
  const handleZoomChange = useCanvasZoom(canvas, zoomLevel, setZoomLevel)

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
      // Le canevas reste de taille fixe, seul le zoom impactera l'affichage
      canvas.setWidth(mmToPx(labelConfig.labelWidth))
      canvas.setHeight(mmToPx(labelConfig.labelHeight))
      canvas.renderAll()
    }
  }, [canvas, labelConfig.labelWidth, labelConfig.labelHeight])

  // Gestion des événements du canevas (sélection, mouvement, redimensionnement)
  useCanvasEvents(canvas, setSelectedObject, setSelectedColor)

  // Mise à jour de la couleur de l'objet sélectionné
  useSelectedObject(canvas, selectedObject, selectedColor)

  // Ajouter un objet (par exemple, un cercle, un rectangle ou du texte) au canevas
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
