import { jsPDF } from 'jspdf'
import * as fabric from 'fabric'
import { mmToPx } from '../../utils/conversionUtils'

// Fonction pour charger le design dans un canvas temporaire
const loadCanvasDesign = (cellIndex, cellContent, cellWidth, cellHeight, scaleFactor = 4) => {
  return new Promise((resolve, reject) => {
    const canvasElement = document.createElement('canvas')

    const tempCanvas = new fabric.Canvas(canvasElement, {
      width: mmToPx(cellWidth) * scaleFactor,
      height: mmToPx(cellHeight) * scaleFactor
    })

    try {
      cellContent.forEach((objectData) => {
        let fabricObject

        switch (objectData.type) {
          case 'IText':
            fabricObject = new fabric.IText(objectData.text || '', {
              left: objectData.left * scaleFactor,
              top: objectData.top * scaleFactor,
              fontSize: objectData.fontSize * scaleFactor,
              fill: objectData.fill || '#000'
            })
            break
          case 'rect':
            fabricObject = new fabric.Rect({
              left: objectData.left * scaleFactor,
              top: objectData.top * scaleFactor,
              fill: objectData.fill || '#000',
              width: objectData.width * scaleFactor,
              height: objectData.height * scaleFactor
            })
            break
          case 'circle':
            fabricObject = new fabric.Circle({
              left: objectData.left * scaleFactor,
              top: objectData.top * scaleFactor,
              fill: objectData.fill || '#000',
              radius: objectData.radius * scaleFactor
            })
            break
          case 'triangle':
            fabricObject = new fabric.Triangle({
              left: objectData.left * scaleFactor,
              top: objectData.top * scaleFactor,
              fill: objectData.fill || '#000',
              width: objectData.width * scaleFactor,
              height: objectData.height * scaleFactor
            })
            break
          default:
            console.warn(`Type d'objet inconnu lors du chargement : ${objectData.type}`)
            return // Ignore les objets inconnus
        }

        tempCanvas.add(fabricObject)
      })

      tempCanvas.renderAll()

      setTimeout(() => {
        const imgData = tempCanvas.toDataURL('image/png')
        resolve(imgData)
      }, 300)
    } catch (error) {
      reject(
        new Error(
          `Erreur lors du chargement du contenu de la cellule ${cellIndex}: ${error.message}`
        )
      )
    }
  })
}

// Fonction pour calculer les positions des cellules sur une page PDF
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

// Fonction principale : Exporter la grille en PDF
export const exportGridToPDF = async (grid, cellContents, config) => {
  console.log('Export PDF appelé avec :', { grid, cellContents, config })
  const {
    labelsPerRow,
    labelsPerColumn,
    offsetTop,
    offsetLeft,
    cellWidth,
    cellHeight,
    spacingVertical,
    spacingHorizontal
  } = calculateGridPositions(config, config.pageWidth, config.pageHeight) // Dimensions A4 ou personnalisées

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

    const tasks = [] // Liste des promesses pour les images générées

    for (let row = 0; row < labelsPerColumn; row++) {
      for (let col = 0; col < labelsPerRow; col++) {
        const cellIndex = row * labelsPerRow + col
        const cell = pageCells[cellIndex]
        const cellContent = cell && cellContents[cell?.id]

        // Vérifier si la cellule est marquée comme initiale
        const isInitialContent =
          cellContent && cellContent.every((objectData) => objectData.isInitialContent)

        if (cellContent && !isInitialContent) {
          // Charger uniquement les cellules avec contenu réel
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

        // Avancer horizontalement
        x += cellWidth + spacingHorizontal
      }

      // Retourner au début de la ligne et avancer verticalement
      x = offsetLeft
      y += cellHeight + spacingVertical
    }

    // Attendre que toutes les promesses soient résolues
    await Promise.all(tasks)

    // Ajouter une nouvelle page si ce n'est pas la dernière
    if (pageIndex < totalPages - 1) {
      pdf.addPage()
    }
  }

  // Télécharger le fichier PDF généré
  pdf.save('grid_export.pdf')
}

export default exportGridToPDF
