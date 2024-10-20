import { jsPDF } from 'jspdf'
import * as fabric from 'fabric'

// Conversion mm en pixels basée sur le même calcul que dans votre CanvasContext
const mmToPx = (mm) => (mm / 25.4) * 72

// Fonction pour charger le design dans un canvas temporaire avec une résolution plus élevée
const loadCanvasDesign = (cellIndex, cellDesign, labelWidth, labelHeight, scaleFactor = 4) => {
  return new Promise((resolve, reject) => {
    const canvasElement = document.createElement('canvas')

    // Augmenter la résolution du canvas temporaire en utilisant un scaleFactor
    const tempCanvas = new fabric.Canvas(canvasElement, {
      width: mmToPx(labelWidth) * scaleFactor, // Largeur augmentée pour une meilleure qualité
      height: mmToPx(labelHeight) * scaleFactor // Hauteur augmentée pour une meilleure qualité
    })

    // Charger le design depuis le JSON
    tempCanvas.loadFromJSON(cellDesign, () => {
      // Appliquer le zoom au canvas pour adapter les objets à la nouvelle résolution
      tempCanvas.setZoom(scaleFactor) // Ajuster le zoom pour correspondre à la taille réelle

      tempCanvas.renderAll() // Forcer le rendu du design

      setTimeout(() => {
        const objects = tempCanvas.getObjects()
        if (objects.length > 0) {
          console.log(`Objet chargé dans le canvas pour la cellule ${cellIndex}:`, objects)

          // Récupérer l'image du canvas en base64 avec une meilleure qualité
          const imgData = tempCanvas.toDataURL('image/png') // Générer l'image avec haute qualité
          resolve(imgData)
        } else {
          reject(new Error("Aucun objet n'a été chargé dans le canvas."))
        }
      }, 500) // Attendre que tout soit bien rendu
    })
  })
}

const exportGridToPDF = async (labelConfig, cellDesigns) => {
  const { labelWidth, labelHeight, offsetTop, offsetLeft, spacingVertical, spacingHorizontal } =
    labelConfig

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = 210
  const pageHeight = 297

  let x = offsetLeft
  let y = offsetTop

  const labelsPerRow = Math.floor((pageWidth - offsetLeft) / (labelWidth + spacingHorizontal))
  const labelsPerColumn = Math.floor((pageHeight - offsetTop) / (labelHeight + spacingVertical))

  // Boucle sur chaque cellule pour charger son contenu
  for (let row = 0; row < labelsPerColumn; row++) {
    for (let col = 0; col < labelsPerRow; col++) {
      const cellIndex = row * labelsPerRow + col

      if (cellDesigns[cellIndex]) {
        console.log(`Chargement du design pour la cellule ${cellIndex}`)
        try {
          // Charger le design de la cellule avec une résolution plus élevée
          const imgData = await loadCanvasDesign(
            cellIndex,
            cellDesigns[cellIndex],
            labelWidth,
            labelHeight,
            4 // Facteur d'échelle pour améliorer la qualité
          )

          // Ajouter l'image au PDF en réduisant sa taille à l'échelle normale
          pdf.addImage(imgData, 'PNG', x, y, labelWidth, labelHeight)
        } catch (error) {
          console.error(`Erreur lors du rendu de la cellule ${cellIndex}:`, error)
        }
      } else {
        // Optionnel : Ajouter une cellule vide ou bordée
        // pdf.setDrawColor(200, 200, 200)
        // pdf.rect(x, y, labelWidth, labelHeight)
      }

      // Avancer horizontalement
      x += labelWidth + spacingHorizontal
    }

    // Retourner au début de la ligne et avancer verticalement
    x = offsetLeft
    y += labelHeight + spacingVertical
  }

  // Enregistrer le fichier PDF
  pdf.save('grid_layout_with_images_high_quality.pdf')
}

export default exportGridToPDF
