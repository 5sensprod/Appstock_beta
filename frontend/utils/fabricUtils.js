//frontend\utils\fabricUtils.js
import QRCode from 'qrcode'
import { rgbToHex } from './conversionUtils'
import { extractObjectProperties, TYPE_PROPERTY_GROUPS } from './objectPropertiesConfig'
import { GradientService } from '../services/GradientService'

import * as fabric from 'fabric'

// Fonction pour créer un objet Fabric
// Fonction pour créer un objet Fabric
export const createFabricObject = (obj, scaleFactor = 1) => {
  const { type, isQRCode = false, ...fabricOptions } = obj

  // Appliquer le scaleFactor aux propriétés de l'ombre si elles existent
  if (fabricOptions.shadow) {
    fabricOptions.shadow = new fabric.Shadow({
      color: fabricOptions.shadow.color || 'rgba(0, 0, 0, 0.5)',
      blur: (fabricOptions.shadow.blur || 0) * scaleFactor,
      offsetX: (fabricOptions.shadow.offsetX || 0) * scaleFactor,
      offsetY: (fabricOptions.shadow.offsetY || 0) * scaleFactor
    })
  }

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
    // strokeUniform: true,
    isQRCode
  }

  switch (type.toLowerCase()) {
    case 'circle':
      console.log('Création du cercle avec les propriétés :', scaledOptions)
      return Promise.resolve(new fabric.Circle(scaledOptions))
    case 'rect':
      return Promise.resolve(new fabric.Rect(scaledOptions))
    case 'i-text':
    case 'text':
      return Promise.resolve(new fabric.IText(obj.text || '', scaledOptions))
    case 'textbox':
      return Promise.resolve(new fabric.Textbox(obj.text || '', scaledOptions))
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

          // Préserver les proportions originales
          const originalWidth = img.width
          const originalHeight = img.height
          fabricImage.set({
            width: originalWidth,
            height: originalHeight
          })

          fabricImage.toObject = (function (toObject) {
            return function () {
              return {
                ...toObject.call(this),
                isQRCode: this.isQRCode
              }
            }
          })(fabricImage.toObject)

          fabricImage.isQRCode = isQRCode
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
    // strokeWidth: 0,
    // stroke: null,
    borderColor: 'transparent',
    cornerColor: 'transparent',
    cornerSize: 0,
    padding: 0,
    transparentCorners: true,
    hasBorders: false
  }

  const validatedObjects = objects.map((obj) => {
    const type = obj.isQRCode ? 'qrcode' : obj.type
    const propertyGroups = TYPE_PROPERTY_GROUPS[type] || ['basic']

    let validatedObj = {
      ...obj,
      ...baseObjectProps,
      ...extractObjectProperties(obj, propertyGroups, scaleFactor)
    }

    // Si l'objet a un gradient, utiliser GradientService pour le recréer
    if (obj.fill && typeof obj.fill === 'object' && obj.fill.type) {
      const gradientProps = {
        type: obj.fill.type,
        colors: obj.fill.colorStops.map((stop) => stop.color),
        offsets: obj.fill.colorStops.map((stop) => stop.offset),
        direction: obj.fill.gradientAngle || obj.gradientDirection || 0 // Utiliser l'angle sauvegardé
      }
      validatedObj.gradientInfo = gradientProps
    }

    return validatedObj
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

        // Réappliquer le gradient avec le service
        const originalObj = validatedObjects.find((obj) => obj.id === fabricObject.id)
        if (originalObj?.gradientInfo) {
          const gradient = GradientService.createGradient(
            fabricObject,
            originalObj.gradientInfo.type,
            originalObj.gradientInfo.colors,
            originalObj.gradientInfo.direction, // Utiliser la direction sauvegardée
            originalObj.gradientInfo.offsets
          )
          fabricObject.set('fill', gradient)
          fabricObject.set('gradientDirection', originalObj.gradientInfo.direction) // Sauvegarder la direction
        }
      }
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
