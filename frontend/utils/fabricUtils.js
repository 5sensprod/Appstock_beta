// utils/fabricUtils.js

import * as fabric from 'fabric'

// Fonction pour créer un objet Fabric
export const createFabricObject = (obj, scaleFactor = 1) => {
  const { type, isQRCode = false, ...fabricOptions } = obj // Ajout de `isQRCode`

  const scaledOptions = {
    ...fabricOptions,
    left: fabricOptions.left ? fabricOptions.left * scaleFactor : 0,
    top: fabricOptions.top ? fabricOptions.top * scaleFactor : 0,
    width: fabricOptions.width ? fabricOptions.width * scaleFactor : undefined,
    height: fabricOptions.height ? fabricOptions.height * scaleFactor : undefined,
    radius: fabricOptions.radius ? fabricOptions.radius * scaleFactor : undefined,
    fontSize: fabricOptions.fontSize ? fabricOptions.fontSize * scaleFactor : undefined,
    scaleX: fabricOptions.scaleX || 1,
    scaleY: fabricOptions.scaleY || 1,
    angle: fabricOptions.angle || 0,
    originX: fabricOptions.originX || 'left',
    originY: fabricOptions.originY || 'top',
    fill: fabricOptions.fill || 'rgba(0, 0, 0, 0.5)',
    stroke: fabricOptions.stroke || null,
    strokeWidth: fabricOptions.strokeWidth || 1,
    isQRCode
  }

  switch (type.toLowerCase()) {
    case 'i-text':
    case 'text':
      return Promise.resolve(new fabric.IText(obj.text || '', scaledOptions))
    case 'textbox':
      return Promise.resolve(new fabric.Textbox(obj.text || '', scaledOptions))
    case 'rect':
      return Promise.resolve(new fabric.Rect(scaledOptions))
    case 'circle':
      console.log('Création du cercle avec les propriétés :', scaledOptions)
      return Promise.resolve(
        new fabric.Circle({
          ...scaledOptions,
          width: (scaledOptions.radius || 25) * 2, // Largeur = 2 * rayon
          height: (scaledOptions.radius || 25) * 2, // Hauteur = 2 * rayon (optionnel si attendu)
          radius: scaledOptions.radius || 25,
          originX: scaledOptions.originX || 'left',
          originY: scaledOptions.originY || 'top'
        })
      )
    case 'triangle':
      return Promise.resolve(new fabric.Triangle(scaledOptions))
    case 'image':
      const img = new Image()
      img.src = obj.src
      return new Promise((resolve, reject) => {
        img.onload = () => {
          const fabricImage = new fabric.Image(img, {
            ...scaledOptions,
            scaleX: (fabricOptions.scaleX || 1) * scaleFactor,
            scaleY: (fabricOptions.scaleY || 1) * scaleFactor
          })

          // Étendre `toObject` pour inclure `isQRCode`
          fabricImage.toObject = (function (toObject) {
            return function () {
              return {
                ...toObject.call(this),
                isQRCode: this.isQRCode // Ajouter `isQRCode`
              }
            }
          })(fabricImage.toObject)

          fabricImage.isQRCode = isQRCode // Ajouter la propriété à l'instance
          resolve(fabricImage)
        }
        img.onerror = reject
      })
    default:
      console.warn(`Type d'objet inconnu : ${type}`)
      return Promise.resolve(null)
  }
}

// Fonction pour charger des objets sur un canvas
export const loadCanvasObjects = async (canvas, objects, scaleFactor = 1) => {
  if (!canvas) throw new Error('Canvas non disponible')

  canvas.clear()

  const validatedObjects = objects.map((obj) => {
    // Appliquer des valeurs par défaut pour les formes
    if (obj.type === 'rect' || obj.type === 'triangle') {
      return {
        ...obj,
        width: obj.width || 50,
        height: obj.height || 50
      }
    }

    if (obj.type === 'circle') {
      return {
        ...obj,
        radius: obj.radius || 25, // Ajouter un rayon par défaut
        left: obj.left || 0,
        top: obj.top || 0
      }
    }

    // S'assurer que `isQRCode` est présent dans tous les objets
    return {
      ...obj,
      isQRCode: obj.isQRCode || false
    }
  })

  const fabricObjects = await Promise.all(
    validatedObjects.map((obj) => createFabricObject(obj, scaleFactor))
  )

  fabricObjects.forEach((fabricObject) => {
    if (fabricObject) {
      canvas.add(fabricObject)
    }
  })

  canvas.renderAll()
  return canvas
}
