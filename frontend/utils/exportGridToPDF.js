import { jsPDF } from 'jspdf'
import * as fabric from 'fabric'

// Conversion mm en pixels
const mmToPx = (mm) => (mm / 25.4) * 72

// Fonction pour charger le design dans un canvas temporaire
const loadCanvasDesign = (cellIndex, cellDesign, labelWidth, labelHeight, scaleFactor = 4) => {
  return new Promise((resolve, reject) => {
    const canvasElement = document.createElement('canvas')

    const tempCanvas = new fabric.Canvas(canvasElement, {
      width: mmToPx(labelWidth) * scaleFactor,
      height: mmToPx(labelHeight) * scaleFactor
    })

    tempCanvas.loadFromJSON(cellDesign, () => {
      tempCanvas.setZoom(scaleFactor)
      tempCanvas.renderAll()

      setTimeout(() => {
        const objects = tempCanvas.getObjects()
        if (objects.length > 0) {
          const imgData = tempCanvas.toDataURL('image/png')
          resolve(imgData)
        } else {
          reject(new Error(`Aucun objet n'a été chargé pour la cellule ${cellIndex}.`))
        }
      }, 500)
    })
  })
}

// Fonction pour calculer les positions des cellules sur la page
const calculateGridPositions = (labelConfig, pageWidth, pageHeight) => {
  const { labelWidth, labelHeight, offsetTop, offsetLeft, spacingVertical, spacingHorizontal } =
    labelConfig

  const labelsPerRow = Math.floor((pageWidth - offsetLeft) / (labelWidth + spacingHorizontal))
  const labelsPerColumn = Math.floor((pageHeight - offsetTop) / (labelHeight + spacingVertical))

  return {
    labelsPerRow,
    labelsPerColumn,
    offsetTop,
    offsetLeft,
    labelWidth,
    labelHeight,
    spacingVertical,
    spacingHorizontal
  }
}

const exportGridToPDF = async (labelConfig, cellDesigns) => {
  const {
    labelsPerRow,
    labelsPerColumn,
    offsetTop,
    offsetLeft,
    labelWidth,
    labelHeight,
    spacingVertical,
    spacingHorizontal
  } = calculateGridPositions(labelConfig, 210, 297) // Dimensions A4

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  let x = offsetLeft
  let y = offsetTop

  const tasks = [] // Stocker les promesses de chargement des designs

  // Boucle sur chaque cellule
  for (let row = 0; row < labelsPerColumn; row++) {
    for (let col = 0; col < labelsPerRow; col++) {
      const cellIndex = row * labelsPerRow + col

      if (cellDesigns[cellIndex]) {
        // Capturer les valeurs actuelles de x et y dans des variables locales
        const currentX = x
        const currentY = y

        const loadTask = loadCanvasDesign(
          cellIndex,
          cellDesigns[cellIndex],
          labelWidth,
          labelHeight,
          4
        )
          .then((imgData) => {
            // Utiliser les valeurs capturées de currentX et currentY
            pdf.addImage(imgData, 'PNG', currentX, currentY, labelWidth, labelHeight)
          })
          .catch((error) => {
            console.error(`Erreur lors du rendu de la cellule ${cellIndex}:`, error)
          })

        tasks.push(loadTask)
      }

      // Avancer horizontalement
      x += labelWidth + spacingHorizontal
    }

    // Retourner au début de la ligne et avancer verticalement
    x = offsetLeft
    y += labelHeight + spacingVertical
  }

  // Attendre que toutes les images soient chargées
  await Promise.all(tasks)

  // Enregistrer le fichier PDF
  pdf.save('grid_layout_with_images_high_quality.pdf')
}

export default exportGridToPDF
