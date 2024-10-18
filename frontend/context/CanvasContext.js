import React, { createContext, useEffect, useRef, useState, useContext, useCallback } from 'react'
import * as fabric from 'fabric'
import useCanvasZoom from '../hooks/useCanvasZoom'
import useUpdateCanvasSize from '../hooks/useUpdateCanvasSize'
import useCanvasEvents from '../hooks/useCanvasEvents'
import useSelectedObject from '../hooks/useSelectedObject'

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

  const [selectedCell, setSelectedCell] = useState(0) // Cellule sélectionnée par défaut
  const [cellDesigns, setCellDesigns] = useState({})
  const [totalCells, setTotalCells] = useState(0) // Nombre total de cellules

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
    } else {
      canvas.setWidth(mmToPx(labelConfig.labelWidth))
      canvas.setHeight(mmToPx(labelConfig.labelHeight))
      canvas.renderAll()
    }
  }, [canvas, labelConfig.labelWidth, labelConfig.labelHeight])

  // Fonction pour charger le design de la cellule sélectionnée
  const loadCellDesign = useCallback(
    (cellIndex) => {
      if (canvas) {
        if (cellDesigns[cellIndex]) {
          canvas.clear()
          canvas.loadFromJSON(cellDesigns[cellIndex], () => {
            setTimeout(() => {
              canvas.renderAll() // Forcer le rendu après un léger délai
            }, 10)
          })
        } else {
          canvas.clear()
          canvas.renderAll() // Forcer le rendu même si la cellule est vide
        }
      }
    },
    [canvas, cellDesigns]
  )

  // Chargement automatique du design de la première cellule
  useEffect(() => {
    loadCellDesign(selectedCell) // Charger le design de la cellule sélectionnée
  }, [selectedCell, loadCellDesign])

  // Sauvegarde du design actuel dans la cellule sélectionnée
  const saveCellDesign = () => {
    if (canvas) {
      const currentDesign = JSON.stringify(canvas)
      setCellDesigns((prevDesigns) => ({
        ...prevDesigns,
        [selectedCell]: currentDesign
      }))
    }
  }

  // Propager le design actuel à toutes les cellules
  const propagateDesignToAllCells = () => {
    if (canvas && cellDesigns[selectedCell]) {
      const currentDesign = JSON.stringify(canvas)
      const newDesigns = {}
      for (let i = 0; i < totalCells; i++) {
        newDesigns[i] = currentDesign
      }
      setCellDesigns(newDesigns) // Mettre à jour les designs de toutes les cellules
      canvas.renderAll() // Forcer le rendu
    }
  }

  // Mise à jour de l'état des cellules
  useEffect(() => {
    const { labelWidth, labelHeight, offsetTop, offsetLeft, spacingVertical, spacingHorizontal } =
      labelConfig

    const pageWidth = 210 // A4 en mm
    const pageHeight = 297 // A4 en mm

    const availableWidth = pageWidth - offsetLeft
    const availableHeight = pageHeight - offsetTop

    // Calcul du nombre d'étiquettes par ligne et colonne
    const labelsPerRow = Math.floor(
      (availableWidth + spacingHorizontal) / (labelWidth + spacingHorizontal)
    )
    const labelsPerColumn = Math.floor(
      (availableHeight + spacingVertical) / (labelHeight + spacingVertical)
    )

    const total = labelsPerRow * labelsPerColumn
    setTotalCells(total)
  }, [labelConfig])

  useCanvasEvents(canvas, setSelectedObject, setSelectedColor)
  useSelectedObject(canvas, selectedObject, selectedColor)

  const addObjectToCanvas = (object) => {
    if (canvas) {
      const centerX = mmToPx(labelConfig.labelWidth / 2) // Centre du canevas (X)
      const centerY = mmToPx(labelConfig.labelHeight / 2) // Centre du canevas (Y)

      object.set({
        left: centerX - (object.width || 0) / 2, // Centrer horizontalement
        top: centerY - (object.height || 0) / 2 // Centrer verticalement
      })

      canvas.add(object)
      canvas.setActiveObject(object)
      canvas.renderAll()

      // Sauvegarder le design à chaque ajout d'objet
      saveCellDesign()
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
    selectedCell,
    setSelectedCell,
    saveCellDesign,
    propagateDesignToAllCells,
    setTotalCells,
    onAddCircle,
    onAddRectangle,
    onAddText
  }

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
}

export { CanvasContext, CanvasProvider, useCanvas }
