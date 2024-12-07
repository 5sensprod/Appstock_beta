// services/GradientService.js
import { GRADIENT_PROPERTIES } from '../utils/objectPropertiesConfig'
import * as fabric from 'fabric'

export class GradientService {
  static calculateLinearCoordinate(prop, width, height, direction) {
    const angleRad = (direction * Math.PI) / 180
    const halfDiagonal = Math.sqrt(width * width + height * height) / 2
    const dx = Math.cos(angleRad)
    const dy = Math.sin(angleRad)

    switch (prop) {
      case 'x1':
        return -dx * halfDiagonal
      case 'y1':
        return -dy * halfDiagonal
      case 'x2':
        return dx * halfDiagonal
      case 'y2':
        return dy * halfDiagonal
      case 'angle':
        return direction
      default:
        return 0
    }
  }

  static calculateRadialCoordinate(prop, width, height, offsets) {
    const baseRadius = Math.min(width, height) / 2
    const centerX = width / 2
    const centerY = height / 2

    switch (prop) {
      case 'r1':
        return baseRadius * Math.min(offsets[0], offsets[1])
      case 'r2':
        return baseRadius * Math.max(offsets[0], offsets[1])
      case 'x1':
      case 'x2':
        return centerX
      case 'y1':
      case 'y2':
        return centerY
      default:
        return 0
    }
  }

  static calculateGradientCoordinates(object, type, colors, direction, offsets) {
    const baseWidth = object.width
    const baseHeight = object.height
    const globalScaleX = object.scaleX
    const globalScaleY = object.scaleY

    const coords = {}

    if (type === 'radial') {
      // Calcul du centre en tenant compte de la position de l'objet
      const scale = Math.min(globalScaleX, globalScaleY)
      const centerX = baseWidth / 2
      const centerY = baseHeight / 2

      GRADIENT_PROPERTIES.radial.forEach((prop) => {
        if (prop.startsWith('r')) {
          // Pour les rayons
          const baseCoord = this.calculateRadialCoordinate(prop, baseWidth, baseHeight, offsets)
          coords[prop] = baseCoord * scale
        } else if (prop.includes('x')) {
          // Pour les coordonnées x du centre
          coords[prop] = centerX
        } else if (prop.includes('y')) {
          // Pour les coordonnées y du centre
          coords[prop] = centerY
        }
      })
    }

    return coords
  }

  static createGradient(object, type, colors, direction, offsets) {
    const coords = this.calculateGradientCoordinates(object, type, colors, direction, offsets)

    return new fabric.Gradient({
      type,
      coords,
      colorStops: colors.map((color, index) => ({
        offset: offsets[index],
        color
      }))
    })
  }

  static serializeGradient(gradientObject) {
    if (!gradientObject.fill || !gradientObject.fill.type) return null

    // Stocker aussi les dimensions et scales originaux
    return {
      type: gradientObject.fill.type,
      colors: gradientObject.fill.colorStops.map((stop) => stop.color),
      direction: gradientObject.gradientDirection || 0,
      offsets: gradientObject.fill.colorStops.map((stop) => stop.offset),
      coords: gradientObject.fill.coords,
      originalWidth: gradientObject.width,
      originalHeight: gradientObject.height,
      originalScaleX: gradientObject.scaleX,
      originalScaleY: gradientObject.scaleY
    }
  }

  static deserializeGradient(gradientData, scaleFactor = 1) {
    if (!gradientData) return null

    // Recalculer les coordonnées en tenant compte des dimensions originales
    const coords = this.calculateGradientCoordinates(
      {
        width: gradientData.originalWidth,
        height: gradientData.originalHeight,
        scaleX: gradientData.originalScaleX * scaleFactor,
        scaleY: gradientData.originalScaleY * scaleFactor
      },
      gradientData.type,
      gradientData.colors,
      gradientData.direction,
      gradientData.offsets
    )

    return new fabric.Gradient({
      type: gradientData.type,
      coords,
      colorStops: gradientData.colors.map((color, index) => ({
        offset: gradientData.offsets[index],
        color
      }))
    })
  }
}
