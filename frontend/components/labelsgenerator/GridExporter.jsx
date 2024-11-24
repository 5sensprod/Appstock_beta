import { jsPDF } from 'jspdf'
import * as fabric from 'fabric'
import { mmToPx } from '../../utils/conversionUtils'
import { loadCanvasObjects } from '../../utils/fabricUtils'

const renderCircleDirectly = (ctx, circle, scaleFactor) => {
  ctx.save()
  ctx.beginPath()

  // Appliquer la transformation
  ctx.translate(circle.left * scaleFactor, circle.top * scaleFactor)
  ctx.rotate((circle.angle * Math.PI) / 180)
  ctx.scale(circle.scaleX, circle.scaleY)

  // Dessiner le cercle
  ctx.arc(0, 0, (circle.radius || 25) * scaleFactor, 0, 2 * Math.PI)

  // Appliquer le style
  ctx.fillStyle = circle.fill || 'rgba(0, 0, 0, 0.5)'
  if (circle.stroke) {
    ctx.strokeStyle = circle.stroke
    ctx.lineWidth = (circle.strokeWidth || 1) * scaleFactor
    ctx.stroke()
  }
  ctx.fill()

  ctx.restore()
}

export const loadCanvasDesign = async (
  cellIndex,
  cellContent,
  cellWidth,
  cellHeight,
  scaleFactor = 4
) => {
  const canvasElement = document.createElement('canvas')
  const width = mmToPx(cellWidth) * scaleFactor
  const height = mmToPx(cellHeight) * scaleFactor

  canvasElement.width = width
  canvasElement.height = height

  const ctx = canvasElement.getContext('2d')
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)

  // Séparer les cercles des autres objets
  const circles = cellContent.filter((obj) => obj.type.toLowerCase() === 'circle')
  const otherObjects = cellContent.filter((obj) => obj.type.toLowerCase() !== 'circle')

  // Créer un canvas Fabric.js pour les autres objets
  const fabricCanvas = new fabric.Canvas(document.createElement('canvas'), {
    width: width,
    height: height
  })

  try {
    // Charger d'abord les objets non-cercles avec Fabric.js
    if (otherObjects.length > 0) {
      await loadCanvasObjects(fabricCanvas, otherObjects, scaleFactor)
      // Copier le contenu du canvas Fabric vers notre canvas principal
      ctx.drawImage(fabricCanvas.getElement(), 0, 0)
    }

    // Dessiner les cercles directement avec Canvas API
    circles.forEach((circle) => {
      renderCircleDirectly(ctx, circle, scaleFactor)
    })

    return new Promise((resolve) => {
      const imgData = canvasElement.toDataURL('image/png', 1.0)
      fabricCanvas.dispose() // Nettoyage
      resolve(imgData)
    })
  } catch (error) {
    console.error('Erreur détaillée:', error)
    throw new Error(
      `Erreur lors du chargement du contenu de la cellule ${cellIndex}: ${error.message}`
    )
  }
}

// Reste du code d'export inchangé...

const calculateGridPositions = (config, pageWidth, pageHeight) => {
  const { cellWidth, cellHeight, offsetTop, offsetLeft, spacingVertical, spacingHorizontal } =
    config

  const labelsPerRow = Math.floor((pageWidth - offsetLeft) / (cellWidth + spacingHorizontal))
  const labelsPerColumn = Math.floor((pageHeight - offsetTop) / (cellHeight + spacingVertical))

  return {
    labelsPerRow,
    labelsPerColumn,
    offsetTop,
    offsetLeft,
    cellWidth,
    cellHeight,
    spacingVertical,
    spacingHorizontal
  }
}

export const exportGridToPDF = async (grid, cellContents, config) => {
  const {
    labelsPerRow,
    labelsPerColumn,
    offsetTop,
    offsetLeft,
    cellWidth,
    cellHeight,
    spacingVertical,
    spacingHorizontal
  } = calculateGridPositions(config, config.pageWidth, config.pageHeight)

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [config.pageWidth, config.pageHeight]
  })

  const totalPages = Math.max(...grid.map((cell) => cell.pageIndex)) + 1

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const pageCells = grid.filter((cell) => cell.pageIndex === pageIndex)

    let x = offsetLeft
    let y = offsetTop

    const tasks = []

    for (let row = 0; row < labelsPerColumn; row++) {
      for (let col = 0; col < labelsPerRow; col++) {
        const cellIndex = row * labelsPerRow + col
        const cell = pageCells[cellIndex]
        const cellContent = cell && cellContents[cell?.id]

        if (cellContent) {
          const currentX = x
          const currentY = y

          const loadTask = loadCanvasDesign(cellIndex, cellContent, cellWidth, cellHeight, 4)
            .then((imgData) => {
              pdf.addImage(imgData, 'PNG', currentX, currentY, cellWidth, cellHeight)
            })
            .catch((error) => {
              console.error(`Erreur lors du rendu de la cellule ${cellIndex}:`, error)
            })

          tasks.push(loadTask)
        }

        x += cellWidth + spacingHorizontal
      }

      x = offsetLeft
      y += cellHeight + spacingVertical
    }

    await Promise.all(tasks)

    if (pageIndex < totalPages - 1) {
      pdf.addPage()
    }
  }

  pdf.save('grid_export.pdf')
}

export default exportGridToPDF
