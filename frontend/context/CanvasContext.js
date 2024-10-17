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

    // Réinitialiser le niveau de zoom à 1
    setZoomLevel(1)

    if (canvas) {
      const newWidthPx = mmToPx(newSize.labelWidth || labelConfig.labelWidth)
      const newHeightPx = mmToPx(newSize.labelHeight || labelConfig.labelHeight)

      // Animer la taille du canevas
      fabric.util.animate({
        startValue: canvas.getWidth(),
        endValue: newWidthPx,
        duration: 500, // Durée de l'animation en ms
        onChange: (value) => {
          canvas.setWidth(value)
          canvas.renderAll() // Redessiner le canevas à chaque étape de l'animation
        }
      })

      fabric.util.animate({
        startValue: canvas.getHeight(),
        endValue: newHeightPx,
        duration: 500, // Durée de l'animation en ms
        onChange: (value) => {
          canvas.setHeight(value)
          canvas.renderAll()
        }
      })

      // Remettre à l'échelle les objets avec animation
      canvas.getObjects().forEach((obj) => {
        const originalScaleX = obj.scaleX / zoomLevel // Échelle d'origine
        const originalScaleY = obj.scaleY / zoomLevel
        const originalLeft = obj.left / zoomLevel
        const originalTop = obj.top / zoomLevel

        fabric.util.animate({
          startValue: obj.scaleX,
          endValue: originalScaleX,
          duration: 500,
          onChange: (value) => {
            obj.scaleX = value
            obj.setCoords() // Met à jour les coordonnées
            canvas.renderAll() // Redessiner
          }
        })

        fabric.util.animate({
          startValue: obj.scaleY,
          endValue: originalScaleY,
          duration: 500,
          onChange: (value) => {
            obj.scaleY = value
            obj.setCoords()
            canvas.renderAll()
          }
        })

        // Animation de la position (left et top)
        fabric.util.animate({
          startValue: obj.left,
          endValue: originalLeft,
          duration: 500,
          onChange: (value) => {
            obj.left = value
            obj.setCoords()
            canvas.renderAll()
          }
        })

        fabric.util.animate({
          startValue: obj.top,
          endValue: originalTop,
          duration: 500,
          onChange: (value) => {
            obj.top = value
            obj.setCoords()
            canvas.renderAll()
          }
        })
      })
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

  const addObjectToCanvas = (object) => {
    if (canvas) {
      const centerX = mmToPx(labelConfig.labelWidth / 2) // Centre du canevas (X)
      const centerY = mmToPx(labelConfig.labelHeight / 2) // Centre du canevas (Y)

      // Positionner l'objet au centre du canevas
      object.set({
        left: centerX - (object.width || 0) / 2, // Centrer horizontalement
        top: centerY - (object.height || 0) / 2 // Centrer verticalement
      })

      canvas.add(object) // Ajouter l'objet au canevas
      scaleAndPositionObject(object, zoomLevel) // Appliquer le zoom
      canvas.renderAll() // Redessiner le canevas
    }
  }

  const onAddCircle = () => {
    // Get the minimum value between labelWidth and labelHeight
    const minDimension = Math.min(labelConfig.labelWidth, labelConfig.labelHeight)

    // Calculate the circle radius based on the smallest dimension
    const circleRadius = minDimension / 2.5

    const circle = new fabric.Circle({
      radius: circleRadius,
      fill: 'blue',
      stroke: '#aaf',
      strokeWidth: 2,
      strokeUniform: true
    })

    addObjectToCanvas(circle) // Use the refactored function
  }

  const onAddRectangle = () => {
    const rectWidth = labelConfig.labelWidth / 1.1
    const rectHeight = labelConfig.labelHeight / 1.1
    const rectangle = new fabric.Rect({
      width: rectWidth,
      height: rectHeight,
      fill: 'green'
    })

    addObjectToCanvas(rectangle) // Utiliser la fonction factorisée
  }

  const onAddText = () => {
    const fontSize = labelConfig.labelWidth / 5 // Taille de la police proportionnelle à la largeur de l'étiquette
    const text = new fabric.IText('Votre texte ici', {
      fontSize: fontSize,
      fill: selectedColor // Utilise la couleur sélectionnée
    })

    addObjectToCanvas(text) // Utiliser la fonction factorisée
  }

  const value = {
    canvasRef,
    canvas,
    zoomLevel,
    setZoomLevel,
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
