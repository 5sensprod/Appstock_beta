//frontend\components\labelsgenerator\GridExporter.jsx
import { jsPDF } from 'jspdf'
import * as fabric from 'fabric'
import { mmToPx } from '../../utils/conversionUtils'
import { loadCanvasObjects } from '../../utils/fabricUtils'

// Fonction pour charger le design dans un canvas temporaire
export const loadCanvasDesign = async (
  cellIndex,
  cellContent,
  cellWidth,
  cellHeight,
  scaleFactor = 4
) => {
  const canvasElement = document.createElement('canvas')
  const ctx = canvasElement.getContext('2d')

  const width = mmToPx(cellWidth) * scaleFactor
  const height = mmToPx(cellHeight) * scaleFactor
  canvasElement.width = width
  canvasElement.height = height

  const tempFabricCanvas = new fabric.Canvas(document.createElement('canvas'), {
    width: width,
    height: height,
    backgroundColor: 'white'
  })

  try {
    const shadowCompensationFactor = 0.25

    const adjustedContent = cellContent.map((obj) => {
      const originalShadow = obj.shadow
      const hasStroke = obj.strokeWidth > 0
      const adjustedObj = {
        ...obj,
        scaleX: obj.scaleX || 1,
        scaleY: obj.scaleY || 1
      }

      if (hasStroke) {
        const isImage = obj.type === 'image' || obj.id?.startsWith('gencode-')

        if (isImage) {
          // Pour les images, on applique juste le scaleFactor
          // strokeUniform: true s'occupe déjà de la cohérence avec le scale de l'image
          adjustedObj.strokeWidth = obj.strokeWidth * scaleFactor
          adjustedObj.strokeUniform = true
        } else {
          adjustedObj.strokeWidth = obj.strokeWidth
        }

        if (obj.patternType && ['dotted', 'dashed'].includes(obj.patternType)) {
          const baseSpacing = 24
          const spacing = baseSpacing / (obj.patternDensity || 5)

          if (obj.patternType === 'dotted') {
            adjustedObj.strokeDashArray = [1, spacing * 2]
          } else {
            adjustedObj.strokeDashArray = [spacing, spacing]
          }

          // Pour les patterns sur les images, appliquer aussi le scaleFactor
          if (isImage) {
            adjustedObj.strokeDashArray = adjustedObj.strokeDashArray.map((v) => v * scaleFactor)
          }
        }
      }

      if (originalShadow) {
        adjustedObj.shadow = { ...originalShadow }

        if (obj.type === 'image') {
          ;['blur', 'offsetX', 'offsetY'].forEach((prop) => {
            adjustedObj.shadow[prop] *= shadowCompensationFactor
          })
        }
      }
      return adjustedObj
    })

    await loadCanvasObjects(tempFabricCanvas, adjustedContent, scaleFactor)

    tempFabricCanvas.discardActiveObject()
    tempFabricCanvas.getObjects().forEach((obj) => {
      obj.set({
        selectable: false,
        hasControls: false,
        hasBorders: false,
        active: false
      })
    })

    tempFabricCanvas.renderAll()

    return new Promise((resolve) => {
      setTimeout(() => {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, width, height)

        const fabricDataUrl = tempFabricCanvas.toDataURL({
          format: 'png',
          quality: 1
        })

        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
          const finalDataUrl = canvasElement.toDataURL('image/png', 1.0)
          tempFabricCanvas.dispose()
          resolve(finalDataUrl)
        }
        img.src = fabricDataUrl
      }, 100)
    })
  } catch (error) {
    tempFabricCanvas.dispose()
    throw new Error(
      `Erreur lors du chargement du contenu de la cellule ${cellIndex}: ${error.message}`
    )
  }
}
// Fonction principale : Exporter la grille en PDF
export const exportGridToPDF = async (grid, cellContents, config) => {
  console.log('Export PDF appelé avec :', { grid, cellContents, config })

  // Utiliser la fonction existante pour calculer les dimensions
  // const { columns: labelsPerRow } = calculateGridDimensions(config)

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [config.pageWidth, config.pageHeight]
  })

  const { offsetTop, offsetLeft, cellWidth, cellHeight, spacingHorizontal, spacingVertical } =
    config

  const totalPages = Math.max(...grid.map((cell) => cell.pageIndex)) + 1

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const pageCells = grid.filter((cell) => cell.pageIndex === pageIndex)

    const renderTasks = pageCells
      .filter((cell) => {
        const cellContent = cellContents[cell.id]
        // Ignorer les cellules sans contenu ou avec contenu initial
        return cellContent && !cellContent.every((objectData) => objectData.isInitialContent)
      })
      .map(async (cell) => {
        const cellContent = cellContents[cell.id]

        // Calculer les coordonnées de la cellule
        const x = offsetLeft + cell.col * (cellWidth + spacingHorizontal)
        const y = offsetTop + cell.row * (cellHeight + spacingVertical)

        try {
          const imgData = await loadCanvasDesign(cell.id, cellContent, cellWidth, cellHeight, 4)

          pdf.addImage(imgData, 'PNG', x, y, cellWidth, cellHeight)
        } catch (error) {
          console.error(`Erreur lors du rendu de la cellule ${cell.id}:`, error)
        }
      })

    // Attendre le rendu de toutes les cellules de la page
    await Promise.all(renderTasks)

    // Ajouter une nouvelle page si ce n'est pas la dernière
    if (pageIndex < totalPages - 1) {
      pdf.addPage()
    }
  }

  // Télécharger le fichier PDF généré
  pdf.save('grid_export.pdf')

  // Retourner des informations sur l'export si nécessaire
  return {
    totalPages,
    fileName: 'grid_export.pdf'
  }
}

export default exportGridToPDF
