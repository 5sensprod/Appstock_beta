import { useCallback } from 'react'
import * as fabric from 'fabric'
import { mmToPx, rgbToHex } from '../utils/conversionUtils' // Assure-toi que tu as la fonction de conversion
import FontFaceObserver from 'fontfaceobserver'
import QRCode from 'qrcode'

const useAddObjectToCanvas = (canvas, labelConfig, selectedColor, selectedFont) => {
  const addObjectToCanvas = useCallback(
    (object) => {
      if (!canvas) return

      // Calcul des coordonnées centrales du canevas
      const centerX = mmToPx(labelConfig.labelWidth / 2)
      const centerY = mmToPx(labelConfig.labelHeight / 2)

      object.set({
        left: centerX - object.getScaledWidth() / 2, // Centre horizontalement
        top: centerY - object.getScaledHeight() / 2 // Centre verticalement
      })

      canvas.add(object)
      canvas.setActiveObject(object)
      canvas.renderAll()
    },
    [canvas, labelConfig]
  )

  // Fonction pour ajouter un cercle
  const onAddCircle = useCallback(() => {
    const minDimension = Math.min(labelConfig.labelWidth, labelConfig.labelHeight)
    const circleRadius = minDimension / 2.5

    const circle = new fabric.Circle({
      radius: circleRadius,
      fill: selectedColor,
      stroke: '#aaf',
      strokeWidth: 2,
      strokeUniform: true
    })

    addObjectToCanvas(circle)
  }, [selectedColor, labelConfig, addObjectToCanvas])

  // Fonction pour ajouter un rectangle
  const onAddRectangle = useCallback(() => {
    const rectWidth = labelConfig.labelWidth / 1.1
    const rectHeight = labelConfig.labelHeight / 1.1

    const rectangle = new fabric.Rect({
      width: rectWidth,
      height: rectHeight,
      fill: selectedColor
    })

    addObjectToCanvas(rectangle)
  }, [selectedColor, labelConfig, addObjectToCanvas])

  // Fonction pour ajouter du texte
  const onAddText = useCallback(() => {
    const fontSize = labelConfig.labelWidth / 5

    // Charger la police avec FontFaceObserver avant de créer le texte
    const fontObserver = new FontFaceObserver(selectedFont)

    fontObserver
      .load()
      .then(() => {
        const textBox = new fabric.Textbox('Votre texte ici', {
          fontSize: fontSize,
          fill: selectedColor,
          textAlign: 'left',
          fontFamily: selectedFont // Appliquer la police sélectionnée
        })

        // Ajouter l'objet texte une fois la police chargée
        addObjectToCanvas(textBox)

        // Réinitialiser les dimensions et ajuster la sélection
        textBox.set('dirty', true)
        textBox.initDimensions()
        textBox.setCoords()

        canvas.setActiveObject(textBox)
        canvas.renderAll()
      })
      .catch((error) => {
        console.error(`Erreur lors du chargement de la police ${selectedFont}:`, error)
      })
  }, [selectedColor, labelConfig, selectedFont, addObjectToCanvas, canvas])

  // Fonction pour ajouter une image à partir d'une URL
  const onAddImage = useCallback(
    (file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imgElement = new Image()
        imgElement.src = event.target.result

        imgElement.onload = () => {
          // Obtenir les dimensions de l'image chargée
          const imgWidth = imgElement.naturalWidth
          const imgHeight = imgElement.naturalHeight

          // Obtenir les dimensions du canevas
          const canvasWidth = mmToPx(labelConfig.labelWidth)
          const canvasHeight = mmToPx(labelConfig.labelHeight)

          // Calculer le facteur de réduction pour conserver les proportions
          const scaleFactor = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight)

          // Créer une instance de fabric.Image avec les dimensions ajustées
          const fabricImg = new fabric.FabricImage(imgElement, {
            scaleX: scaleFactor, // Appliquer le facteur de réduction
            scaleY: scaleFactor
          })

          // Ajouter l'image au canevas en la centrant
          addObjectToCanvas(fabricImg)
        }

        imgElement.onerror = () => {
          console.error("Échec du chargement de l'image.")
        }
      }

      if (file) {
        reader.readAsDataURL(file) // Lire le fichier image sélectionné
      }
    },
    [addObjectToCanvas, labelConfig]
  )

  // Ajout de la fonction pour supprimer un objet
  const onDeleteObject = useCallback(() => {
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      canvas.remove(activeObject) // Supprimer l'objet actif du canevas
      canvas.discardActiveObject() // Désélectionner l'objet
      canvas.renderAll() // Re-rendu du canevas
    }
  }, [canvas])

  // Fonction pour ajouter un QR code
  const onAddQrCode = useCallback(
    (text) => {
      if (!canvas) return

      const minDimension = Math.min(labelConfig.labelWidth, labelConfig.labelHeight)
      const qrSize = minDimension / 2

      // Convertir la couleur en hexadécimal
      const validColor = rgbToHex(selectedColor)

      QRCode.toDataURL(
        text,
        {
          width: qrSize,
          margin: 2,
          color: { dark: validColor || '#000000', light: '#ffffff' }
        },
        (err, url) => {
          if (err) {
            console.error('Erreur lors de la génération du QR code :', err)
            return
          }

          const imgElement = new Image()
          imgElement.src = url

          imgElement.onload = () => {
            const imgWidth = imgElement.naturalWidth
            const imgHeight = imgElement.naturalHeight

            const canvasWidth = mmToPx(labelConfig.labelWidth)
            const canvasHeight = mmToPx(labelConfig.labelHeight)

            const scaleFactor = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight)

            const fabricImg = new fabric.Image(imgElement, {
              scaleX: scaleFactor,
              scaleY: scaleFactor
            })

            fabricImg.set({
              isQRCode: true,
              qrText: text
            })

            fabricImg.toObject = (function (toObject) {
              return function () {
                return Object.assign(toObject.call(this), {
                  isQRCode: true,
                  qrText: text
                })
              }
            })(fabricImg.toObject)

            addObjectToCanvas(fabricImg)
          }

          imgElement.onerror = () => {
            console.error("Erreur lors du chargement de l'image QR code.")
          }
        }
      )
    },
    [selectedColor, labelConfig, addObjectToCanvas, canvas]
  )

  const onUpdateQrCode = useCallback(
    (newText, newColor) => {
      const activeObject = canvas.getActiveObject()
      if (activeObject && activeObject.isQRCode) {
        QRCode.toDataURL(
          newText, // Utiliser le texte existant ou un nouveau texte
          {
            width: activeObject.width, // Garder la même taille que l'original
            margin: 2,
            color: { dark: rgbToHex(newColor) || '#000000', light: '#ffffff' } // Utiliser la nouvelle couleur
          },
          (err, url) => {
            if (err) {
              console.error('Erreur lors de la génération du QR code :', err)
              return
            }

            const imgElement = new Image()
            imgElement.src = url

            imgElement.onload = () => {
              activeObject.setElement(imgElement) // Remplacer l'image du QR code
              activeObject.qrText = newText // Mettre à jour le texte associé au QR code
              canvas.renderAll() // Re-rendu du canevas pour appliquer les changements
            }

            imgElement.onerror = () => {
              console.error("Erreur lors du chargement de l'image QR code.")
            }
          }
        )
      }
    },
    [canvas] // Ajout de dépendance au canvas
  )

  return {
    onAddCircle,
    onAddRectangle,
    onAddText,
    onAddImage,
    selectedFont,
    onUpdateQrCode,
    onAddQrCode,
    onDeleteObject
  }
}

export default useAddObjectToCanvas
