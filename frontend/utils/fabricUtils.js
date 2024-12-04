import QRCode from 'qrcode'
import { rgbToHex } from './conversionUtils'

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

  const baseObjectProps = {
    strokeWidth: 0,
    stroke: null,
    borderColor: 'transparent',
    cornerColor: 'transparent',
    cornerSize: 0,
    padding: 0,
    transparentCorners: true,
    hasBorders: false
  }

  const validatedObjects = objects.map((obj) => {
    let validatedObj = {
      ...obj,
      ...baseObjectProps
    }

    // Appliquer des valeurs par défaut pour les formes
    if (obj.type === 'rect' || obj.type === 'triangle') {
      return {
        ...validatedObj,
        width: obj.width || 50,
        height: obj.height || 50
      }
    }
    if (obj.type === 'circle') {
      return {
        ...validatedObj,
        radius: obj.radius || 25,
        left: obj.left || 0,
        top: obj.top || 0
      }
    }
    // S'assurer que `isQRCode` est présent dans tous les objets
    return {
      ...validatedObj,
      isQRCode: obj.isQRCode || false
    }
  })

  const fabricObjects = await Promise.all(
    validatedObjects.map((obj) => createFabricObject(obj, scaleFactor))
  )

  fabricObjects.forEach((fabricObject) => {
    if (fabricObject) {
      // Appliquer les propriétés une fois de plus après la création
      fabricObject.set(baseObjectProps)
      canvas.add(fabricObject)
    }
  })

  canvas.renderAll()
  return canvas
}

export const QRCodeCache = new Map()
export const generateQRCodeImage = async (text, color = '#000000', width = 50) => {
  const cacheKey = `${text}-${color}-${width}`

  if (QRCodeCache.has(cacheKey)) {
    return QRCodeCache.get(cacheKey)
  }

  try {
    const url = await new Promise((resolve, reject) => {
      QRCode.toDataURL(
        text,
        {
          width,
          margin: 2,
          color: { dark: rgbToHex(color), light: '#ffffff' }
        },
        (err, url) => (err ? reject(err) : resolve(url))
      )
    })

    QRCodeCache.set(cacheKey, url)
    return url
  } catch (err) {
    console.error('QR Code generation failed:', err)
    throw err
  }
}

export const createQRCodeFabricImage = async (text, options = {}) => {
  const { color = '#000000', width = 50, height = 50 } = options
  try {
    const url = await generateQRCodeImage(text, color, width)
    const img = new Image()
    img.src = url
    return new Promise((resolve, reject) => {
      img.onload = () => {
        const fabricImage = new fabric.Image(img, {
          width,
          height,
          isQRCode: true,
          qrText: text,
          ...options
        })

        fabricImage.toObject = (function (toObject) {
          return function () {
            return Object.assign(toObject.call(this), {
              isQRCode: true,
              qrText: text,
              src: url
            })
          }
        })(fabricImage.toObject)

        resolve(fabricImage)
      }
      img.onerror = reject
    })
  } catch (err) {
    console.error('Error creating QR code fabric image:', err)
    throw err
  }
}
