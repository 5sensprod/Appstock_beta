//frontend\utils\fabricUtils.js
import QRCode from 'qrcode'
import { rgbToHex } from './conversionUtils'
import { extractObjectProperties, TYPE_PROPERTY_GROUPS } from './objectPropertiesConfig'

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
    strokeWidth: fabricOptions.strokeWidth || 0,
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
    // Déterminer le type et les groupes de propriétés associés
    const type = obj.isQRCode ? 'qrcode' : obj.type
    const propertyGroups = TYPE_PROPERTY_GROUPS[type] || ['basic']

    // Extraire les propriétés avec le scaling
    let validatedObj = {
      ...obj,
      ...baseObjectProps,
      ...extractObjectProperties(obj, propertyGroups, scaleFactor)
    }

    // Préserver les propriétés du gradient si elles existent
    if (obj.fill && typeof obj.fill === 'object' && obj.fill.type) {
      validatedObj.gradientInfo = {
        type: obj.fill.type,
        colorStops: obj.fill.colorStops,
        coords: scaleGradientCoords(obj.fill.coords, scaleFactor),
        angle: obj.gradientAngle || 0
      }
    }

    // Gérer les dimensions par défaut selon le type
    if (type === 'rect' || type === 'triangle') {
      validatedObj = {
        ...validatedObj,
        width: obj.width || 50,
        height: obj.height || 50
      }
    }
    if (type === 'circle') {
      validatedObj = {
        ...validatedObj,
        radius: obj.radius || 25,
        left: obj.left || 0,
        top: obj.top || 0
      }
    }

    return {
      ...validatedObj,
      isQRCode: type === 'qrcode'
    }
  })

  const fabricObjects = await Promise.all(
    validatedObjects.map((obj) => createFabricObject(obj, scaleFactor))
  )

  fabricObjects.forEach((fabricObject) => {
    if (fabricObject) {
      // Appliquer uniquement les propriétés de base pour les QR codes
      if (fabricObject.isQRCode) {
        fabricObject.set(baseObjectProps)
      } else {
        fabricObject.set({
          borderColor: 'transparent',
          cornerColor: 'transparent',
          cornerSize: 0,
          padding: 0,
          transparentCorners: true,
          hasBorders: false
        })

        // Réappliquer le gradient si nécessaire
        const originalObj = validatedObjects.find((obj) => obj.id === fabricObject.id)
        if (originalObj?.gradientInfo) {
          applyGradientToObject(fabricObject, originalObj.gradientInfo, scaleFactor)
        }
      }
      canvas.add(fabricObject)
    }
  })

  canvas.renderAll()
  return canvas
}

// Fonction utilitaire pour mettre à l'échelle les coordonnées du gradient
const scaleGradientCoords = (coords, scaleFactor) => {
  if (!coords) return null

  const scaledCoords = {}
  for (const [key, value] of Object.entries(coords)) {
    // Mettre à l'échelle toutes les coordonnées sauf les angles et les offsets
    if (['x1', 'x2', 'y1', 'y2', 'r1', 'r2'].includes(key)) {
      scaledCoords[key] = value * scaleFactor
    } else {
      scaledCoords[key] = value
    }
  }
  return scaledCoords
}

// Fonction pour appliquer un gradient à un objet
const applyGradientToObject = (fabricObject, gradientInfo, scaleFactor) => {
  const { type, colorStops, coords, angle } = gradientInfo
  const width = fabricObject.width * fabricObject.scaleX
  const height = fabricObject.height * fabricObject.scaleY

  let gradientOptions = {
    type,
    coords: coords || {},
    colorStops
  }

  if (type === 'linear') {
    const angleRad = (angle * Math.PI) / 180
    const halfDiagonal = Math.sqrt(width * width + height * height) / 2
    const dx = Math.cos(angleRad)
    const dy = Math.sin(angleRad)

    gradientOptions.coords = {
      x1: -dx * halfDiagonal,
      y1: -dy * halfDiagonal,
      x2: dx * halfDiagonal,
      y2: dy * halfDiagonal
    }
  } else if (type === 'radial') {
    const radius = Math.min(width, height) / 2
    const centerX = -width / 2
    const centerY = -height / 2

    gradientOptions.coords = {
      r1: radius * colorStops[0].offset,
      r2: radius * colorStops[1].offset,
      x1: -centerX,
      y1: -centerY,
      x2: -centerX,
      y2: -centerY
    }
  }

  const gradient = new fabric.Gradient(gradientOptions)
  gradient.gradientAngle = angle // Conserver l'angle pour référence future
  fabricObject.set('fill', gradient)
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
