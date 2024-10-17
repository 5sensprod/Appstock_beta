import React, { createContext, useEffect, useRef, useState, useContext } from 'react'
import * as fabric from 'fabric'

const CanvasContext = createContext()

// Hook personnalisé pour utiliser le contexte facilement
const useCanvas = () => useContext(CanvasContext)

// Conversion millimètres en pixels
const mmToPx = (mm) => (mm / 25.4) * 72

const CanvasProvider = ({ children }) => {
  const canvasRef = useRef(null)
  const [canvas, setCanvas] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  // Taille du canevas
  // const [canvasSize, setCanvasSize] = useState({
  //   width: 600,
  //   height: 350
  // })

  // Configuration des labels (la source de vérité est en millimètres)
  const [labelConfig, setLabelConfig] = useState({
    labelWidth: 48.5, // Largeur par défaut en mm
    labelHeight: 25.5, // Hauteur par défaut en mm
    offsetTop: 22,
    offsetLeft: 8,
    spacingVertical: 0,
    spacingHorizontal: 0
  })

  const [selectedColor, setSelectedColor] = useState('#000000') // Couleur sélectionnée par l'utilisateur
  const [selectedObject, setSelectedObject] = useState(null) // Objet sélectionné sur le canevas

  // Fonction pour mettre à jour la taille du canevas (gérée en mm dans ConfigForm)
  const updateCanvasSize = (newSize) => {
    setLabelConfig((prevConfig) => ({
      ...prevConfig,
      ...newSize // Mise à jour des dimensions en millimètres
    }))

    // Si le canevas existe, met à jour sa taille en pixels
    if (canvas) {
      canvas.setWidth(mmToPx(newSize.labelWidth || labelConfig.labelWidth))
      canvas.setHeight(mmToPx(newSize.labelHeight || labelConfig.labelHeight))
      canvas.renderAll()
    }
  }

  useEffect(() => {
    if (!canvas) {
      // Créer l'instance de Fabric.js uniquement si elle n'a pas été créée
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: mmToPx(labelConfig.labelWidth), // Convertir mm en pixels
        height: mmToPx(labelConfig.labelHeight), // Convertir mm en pixels
        preserveObjectStacking: true // Préserver l'ordre des objets
      })
      setCanvas(fabricCanvas)
    } else {
      // Si le canevas existe déjà, ajuster sa taille
      canvas.setWidth(mmToPx(labelConfig.labelWidth))
      canvas.setHeight(mmToPx(labelConfig.labelHeight))
      canvas.renderAll() // Re-render après la modification de la taille
    }
  }, [canvas, labelConfig.labelWidth, labelConfig.labelHeight])

  // Restriction du mouvement et du redimensionnement des objets
  useEffect(() => {
    if (canvas) {
      const restrictObjectMovement = (e) => {
        const obj = e.target
        obj.setCoords()
        const boundingRect = obj.getBoundingRect()

        const canvasWidth = canvas.getWidth()
        const canvasHeight = canvas.getHeight()

        // Limite gauche
        if (boundingRect.left < 0) {
          obj.left -= boundingRect.left
        }

        // Limite supérieure
        if (boundingRect.top < 0) {
          obj.top -= boundingRect.top
        }

        // Limite droite
        if (boundingRect.left + boundingRect.width > canvasWidth) {
          obj.left -= boundingRect.left + boundingRect.width - canvasWidth
        }

        // Limite inférieure
        if (boundingRect.top + boundingRect.height > canvasHeight) {
          obj.top -= boundingRect.top + boundingRect.height - canvasHeight
        }

        obj.setCoords()
      }

      canvas.on('object:moving', restrictObjectMovement)
      canvas.on('object:scaling', restrictObjectMovement)
    }
  }, [canvas])

  // Mettre à jour selectedObject en fonction des événements de sélection
  useEffect(() => {
    if (canvas) {
      const updateSelectedObject = () => {
        const activeObject = canvas.getActiveObject()
        setSelectedObject(activeObject)
        if (activeObject && activeObject.fill) {
          setSelectedColor(activeObject.fill) // Mettre à jour le ColorPicker avec la couleur de l'objet
        }
      }

      canvas.on('selection:created', updateSelectedObject)
      canvas.on('selection:updated', updateSelectedObject)
      canvas.on('selection:cleared', () => {
        setSelectedObject(null)
        setSelectedColor('#000000') // Remettre à la couleur par défaut
      })

      // Nettoyage des événements
      return () => {
        canvas.off('selection:created', updateSelectedObject)
        canvas.off('selection:updated', updateSelectedObject)
        canvas.off('selection:cleared')
      }
    }
  }, [canvas])

  // Mettre à jour la couleur de l'objet sélectionné lorsque selectedColor change
  useEffect(() => {
    if (selectedObject && 'set' in selectedObject) {
      selectedObject.set('fill', selectedColor) // Met à jour la couleur de l'objet
      canvas.renderAll()
    }
  }, [selectedColor, selectedObject, canvas])

  // Fonction pour ajuster le zoom
  const handleZoomChange = (e) => {
    const newZoom = parseFloat(e.target.value)
    const scaleFactor = newZoom / zoomLevel // Facteur d'échelle basé sur le zoom
    setZoomLevel(newZoom)

    if (canvas) {
      // Ajuster la taille du canevas
      const newWidth = mmToPx(labelConfig.labelWidth) * newZoom // Convertir les dimensions en mm -> pixels
      const newHeight = mmToPx(labelConfig.labelHeight) * newZoom // Convertir les dimensions en mm -> pixels
      canvas.setWidth(newWidth)
      canvas.setHeight(newHeight)

      // Mettre à l'échelle tous les objets présents sur le canevas
      canvas.getObjects().forEach((obj) => {
        // Mise à l'échelle de l'objet
        obj.scaleX = obj.scaleX * scaleFactor
        obj.scaleY = obj.scaleY * scaleFactor

        // Ajuster la position
        obj.left = obj.left * scaleFactor
        obj.top = obj.top * scaleFactor

        obj.setCoords() // Mettre à jour les coordonnées après redimensionnement
      })

      canvas.renderAll() // Redessiner le canevas avec les nouvelles dimensions
    }
  }

  // Fonction utilitaire pour la mise à l'échelle et le positionnement
  const scaleAndPositionObject = (object, zoomLevel) => {
    object.scaleX = object.scaleX * zoomLevel
    object.scaleY = object.scaleY * zoomLevel
    object.left = object.left * zoomLevel
    object.top = object.top * zoomLevel
    object.setCoords() // Met à jour les coordonnées après redimensionnement
  }

  const onAddCircle = () => {
    if (canvas) {
      const circle = new fabric.Circle({
        radius: 50,
        fill: 'blue',
        left: 100,
        stroke: '#aaf',
        strokeWidth: 5,
        strokeUniform: true,
        top: 100
      })
      canvas.add(circle)

      // Utiliser la fonction factorisée pour l'échelle et le positionnement
      scaleAndPositionObject(circle, zoomLevel)

      canvas.renderAll()
    }
  }

  const onAddRectangle = () => {
    if (canvas) {
      const rectangle = new fabric.Rect({
        width: 100,
        height: 50,
        fill: 'green',
        left: 200,
        top: 100
      })
      canvas.add(rectangle)

      // Utiliser la fonction factorisée pour l'échelle et le positionnement
      scaleAndPositionObject(rectangle, zoomLevel)

      canvas.renderAll()
    }
  }

  const onAddText = () => {
    if (canvas) {
      const text = new fabric.IText('Votre texte ici', {
        left: 150,
        top: 150,
        fontSize: 30,
        fill: selectedColor // Utilise la couleur sélectionnée
      })
      canvas.add(text)

      // Utiliser la fonction factorisée pour l'échelle et le positionnement
      scaleAndPositionObject(text, zoomLevel)

      canvas.setActiveObject(text) // Sélectionne automatiquement le texte ajouté
      canvas.renderAll()
    }
  }

  const value = {
    canvasRef,
    canvas,
    zoomLevel,
    setZoomLevel,
    // canvasSize,
    updateCanvasSize,
    labelConfig,
    setLabelConfig,
    selectedColor,
    setSelectedColor,
    selectedObject,
    setSelectedObject,
    handleZoomChange,
    onAddCircle,
    onAddRectangle,
    onAddText
  }

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
}

export { CanvasContext, CanvasProvider, useCanvas }
