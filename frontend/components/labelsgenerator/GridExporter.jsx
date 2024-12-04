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
  // Créer un canvas natif au lieu d'un canvas Fabric.js
  const canvasElement = document.createElement('canvas')
  const ctx = canvasElement.getContext('2d')

  // Définir les dimensions
  const width = mmToPx(cellWidth) * scaleFactor
  const height = mmToPx(cellHeight) * scaleFactor
  canvasElement.width = width
  canvasElement.height = height

  // Créer un canvas Fabric.js temporaire pour le rendu initial
  const tempFabricCanvas = new fabric.Canvas(document.createElement('canvas'), {
    width: width,
    height: height,
    backgroundColor: 'white'
  })

  try {
    // Charger les objets sur le canvas Fabric
    await loadCanvasObjects(tempFabricCanvas, cellContent, scaleFactor)

    // Désactiver la sélection et les bordures
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

    // Convertir le canvas Fabric en image
    return new Promise((resolve) => {
      setTimeout(() => {
        // Dessiner sur le canvas natif
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, width, height)

        // Convertir le canvas Fabric en image et la dessiner sur le canvas natif
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
