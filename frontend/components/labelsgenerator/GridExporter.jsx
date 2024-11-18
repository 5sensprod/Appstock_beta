import { jsPDF } from 'jspdf'
import * as fabric from 'fabric'
import { mmToPx } from '../../utils/conversionUtils' // Conversion mm -> pixels, réutilisable

// Fonction pour charger le design dans un canvas temporaire
const loadCanvasDesign = (cellIndex, cellContent, cellWidth, cellHeight, scaleFactor = 4) => {
  return new Promise((resolve, reject) => {
    const canvasElement = document.createElement('canvas')

    const tempCanvas = new fabric.Canvas(canvasElement, {
      width: mmToPx(cellWidth) * scaleFactor,
      height: mmToPx(cellHeight) * scaleFactor
    })

    // Ajouter manuellement les objets dans le canevas si `loadFromJSON` n'est pas utilisé
    try {
      cellContent.forEach((objectData) => {
        const fabricObject = new fabric.IText(objectData.text, {
          left: objectData.left * scaleFactor,
          top: objectData.top * scaleFactor,
          fontSize: objectData.fontSize * scaleFactor,
          fill: objectData.fill || '#000'
        })
        tempCanvas.add(fabricObject)
      })

      tempCanvas.renderAll()

      setTimeout(() => {
        const imgData = tempCanvas.toDataURL('image/png')
        resolve(imgData)
      }, 300) // Donne le temps au canevas de se rendre correctement
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

  let x = offsetLeft
  let y = offsetTop

  const tasks = [] // Liste des promesses pour les images générées

  // Boucle sur chaque cellule dans la grille
  for (let row = 0; row < labelsPerColumn; row++) {
    for (let col = 0; col < labelsPerRow; col++) {
      const cellIndex = row * labelsPerRow + col
      const cell = grid[cellIndex]
      const cellContent = cell && cellContents[cell?.id]

      if (cellContent) {
        // Capturer les coordonnées actuelles
        const currentX = x
        const currentY = y

        const loadTask = loadCanvasDesign(
          cellIndex,
          cellContent,
          cellWidth,
          cellHeight,
          4 // Facteur d'échelle pour qualité élevée
        )
          .then((imgData) => {
            pdf.addImage(imgData, 'PNG', currentX, currentY, cellWidth, cellHeight)
          })
          .catch((error) => {
            console.error(`Erreur lors du rendu de la cellule ${cellIndex}:`, error)
          })

        tasks.push(loadTask)
      } else {
        // Ajouter une bordure pour une cellule vide
        pdf.rect(x, y, cellWidth, cellHeight, 'S') // 'S' pour stroke uniquement
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

  // Télécharger le fichier PDF généré
  pdf.save('grid_export.pdf')
}

export default exportGridToPDF
