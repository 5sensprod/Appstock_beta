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
    const coords = {}

    if (type === 'linear') {
      const angleRad = (direction * Math.PI) / 180
      const halfDiagonal = Math.sqrt(Math.pow(baseWidth, 2) + Math.pow(baseHeight, 2)) / 2
      const dx = Math.cos(angleRad)
      const dy = Math.sin(angleRad)
      coords.x1 = -dx * halfDiagonal
      coords.y1 = -dy * halfDiagonal
      coords.x2 = dx * halfDiagonal
      coords.y2 = dy * halfDiagonal
    } else if (type === 'radial') {
      const scaleX = object.scaleX || 1
      const scaleY = object.scaleY || 1
      const avgScale = (scaleX + scaleY) / 2

      // Centre du gradient
      const centerX = baseWidth / 2
      const centerY = baseHeight / 2
      coords.x1 = centerX
      coords.y1 = centerY
      coords.x2 = centerX
      coords.y2 = centerY

      // Rayon de base ajusté pour maintenir l'aspect visuel
      const baseRadius = Math.min(baseWidth, baseHeight) / 2
      const radiusScale = 1 / avgScale // Inverse du scale pour compenser l'effet de dilatation

      // Ajustement des rayons pour maintenir la distribution visuelle
      coords.r1 = baseRadius * radiusScale * 0.1 // Point central
      coords.r2 = baseRadius * radiusScale // Rayon extérieur
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

    if (type === 'radial' && object.scaleX && object.scaleY) {
      const scaleX = object.scaleX
      const scaleY = object.scaleY
      const avgScale = (scaleX + scaleY) / 2

      // Calcul de la translation pour maintenir le centrage
      const translateX = (object.width * (scaleX - 1)) / 2
      const translateY = (object.height * (scaleY - 1)) / 2

      // Matrice de transformation complète
      gradient.gradientTransform = [
        avgScale,
        0,
        0,
        avgScale,
        -translateX,
        -translateY // Translation négative pour compenser le décalage
      ]
    }

    if (type === 'linear') {
      gradient.gradientAngle = direction
    }

    return gradient
  }

  static updateGradientOnScale(object) {
    if (!object.fill || !object.fill.type) return null

    return this.createGradient(
      object,
      object.fill.type,
      object.fill.colorStops.map((stop) => stop.color),
      object.gradientDirection || 0,
      object.fill.colorStops.map((stop) => stop.offset)
    )
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
