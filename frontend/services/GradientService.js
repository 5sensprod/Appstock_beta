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

    if (type === 'linear') {
      // Logique linéaire inchangée
      const angleRad = (direction * Math.PI) / 180
      const halfDiagonal =
        Math.sqrt(Math.pow(baseWidth * globalScaleX, 2) + Math.pow(baseHeight * globalScaleY, 2)) /
        2
      const dx = Math.cos(angleRad)
      const dy = Math.sin(angleRad)
      coords.x1 = -dx * halfDiagonal
      coords.y1 = -dy * halfDiagonal
      coords.x2 = dx * halfDiagonal
      coords.y2 = dy * halfDiagonal
    } else if (type === 'radial') {
      const scale = Math.min(globalScaleX, globalScaleY)
      const radius = Math.min(baseWidth, baseHeight) / 2

      // Garder la logique d'origine pour radial
      coords.r1 = radius * Math.min(offsets[0], offsets[1]) * scale
      coords.r2 = radius * Math.max(offsets[0], offsets[1]) * scale
      coords.x1 = baseWidth / 2
      coords.y1 = baseHeight / 2
      coords.x2 = baseWidth / 2
      coords.y2 = baseHeight / 2
    }

    return coords
  }

  static createGradient(object, type, colors, direction, offsets) {
    const coords = this.calculateGradientCoordinates(object, type, colors, direction, offsets)
    const gradient = new fabric.Gradient({
      type,
      coords,
      colorStops: colors.map((color, index) => ({
        offset: offsets[index],
        color
      }))
    })

    // Ajouter l'angle pour les dégradés linéaires
    if (type === 'linear') {
      gradient.gradientAngle = direction
    }

    return gradient
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
