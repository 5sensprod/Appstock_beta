// utils/objectPropertiesConfig.js

export const GRADIENT_PROPERTIES = {
  basic: ['type', 'colors', 'direction', 'offsets'],
  linear: ['angle', 'x1', 'y1', 'x2', 'y2'],
  radial: ['r1', 'r2', 'x1', 'y1', 'x2', 'y2']
}

export const OBJECT_PROPERTIES = {
  basic: [
    'id',
    'left',
    'top',
    'fill',
    'angle',
    'scaleX',
    'scaleY',
    'type',
    'width',
    'height',
    'radius',
    'zIndex',
    'opacity',
    'savedOpacity'
  ],
  appearance: [
    'opacity',
    'fill',
    'gradient.type',
    'gradient.colors',
    'gradient.direction',
    'gradient.offsets',
    'gradient.coords'
  ],
  stroke: [
    'stroke',
    'strokeWidth',
    'strokeDashArray',
    'strokeLineCap',
    'strokeUniform',
    'patternType',
    'patternDensity'
  ],
  shadow: [
    'shadowColor',
    'shadowBlur',
    'shadowOffsetX',
    'shadowOffsetY',
    'shadowOpacity',
    'shadow' // pour l'objet shadow complet de fabric
  ],
  text: ['fontSize', 'fontFamily', 'fontStyle', 'fontWeight', 'text'],
  qr: ['isQRCode', 'qrText', 'src']
}

export const TYPE_PROPERTY_GROUPS = {
  rect: ['basic', 'appearance', 'stroke', 'shadow'],
  circle: ['basic', 'appearance', 'stroke', 'shadow'],
  'i-text': ['basic', 'appearance', 'stroke', 'text', 'shadow'],
  textbox: ['basic', 'appearance', 'stroke', 'text', 'shadow'],
  image: ['basic', 'appearance', 'shadow'],
  qrcode: ['basic', 'qr', 'shadow']
}
export const extractObjectProperties = (obj, propertyGroups = ['basic'], scaleFactor = 1) => {
  const props = {}

  propertyGroups.forEach((group) => {
    if (OBJECT_PROPERTIES[group]) {
      OBJECT_PROPERTIES[group].forEach((prop) => {
        if (obj[prop] !== undefined) {
          // Appliquer le scaleFactor aux propriétés qui en ont besoin
          if (
            prop === 'strokeWidth' ||
            prop === 'shadowBlur' ||
            prop === 'shadowOffsetX' ||
            prop === 'shadowOffsetY'
          ) {
            props[prop] = obj[prop] * scaleFactor
          }
          // Traitement spécial pour strokeDashArray
          else if (prop === 'strokeDashArray' && Array.isArray(obj[prop])) {
            props[prop] = obj[prop].map((value) => value * scaleFactor)
          } else {
            props[prop] = obj[prop]
          }
        }
      })
    }
  })

  return props
}

export const extractGradientProperties = (obj, scaleFactor = 1) => {
  const gradientProps = {}
  if (obj.fill && obj.fill.type) {
    gradientProps.type = obj.fill.type
    gradientProps.colors = obj.fill.colorStops.map((stop) => stop.color)
    gradientProps.offsets = obj.fill.colorStops.map((stop) => stop.offset)
    gradientProps.gradientDirection = obj.gradientDirection || 0 // Ajout ici

    // Scaling des coordonnées
    const coords = obj.fill.coords
    gradientProps.coords = Object.entries(coords).reduce((acc, [key, value]) => {
      acc[key] = ['r1', 'r2', 'x1', 'x2', 'y1', 'y2'].includes(key) ? value * scaleFactor : value
      return acc
    }, {})
  }
  return gradientProps
}

export const extractQRCodeProperties = (obj) => {
  const baseProperties = extractObjectProperties(obj, ['basic', 'stroke', 'shadow'])

  return {
    ...baseProperties,
    type: 'image',
    src: obj.getSrc?.() || obj._element?.src || '',
    width: obj.width || 0,
    height: obj.height || 0,
    isQRCode: true,
    qrText: obj.qrText || '',
    // Explicitement extraire les propriétés d'ombre
    ...(obj.shadow && {
      shadow: obj.shadow.toObject(),
      shadowColor: obj.shadow.color,
      shadowBlur: obj.shadow.blur,
      shadowOffsetX: obj.shadow.offsetX,
      shadowOffsetY: obj.shadow.offsetY,
      shadowOpacity: obj.shadow.opacity
    })
  }
}

// Fonction pour appliquer les propriétés synchronisées à un QR code
export const applySyncedPropertiesToQRCode = async (originalItem, layoutItem) => {
  // Si l'élément est lié par CSV, préserver ses propriétés spécifiques
  if (originalItem.linkedByCsv) {
    const syncedProperties = {
      ...originalItem,
      left: layoutItem.left,
      top: layoutItem.top,
      angle: layoutItem.angle,
      scaleX: layoutItem.scaleX,
      scaleY: layoutItem.scaleY,
      // Synchroniser les propriétés d'ombre
      ...(layoutItem.shadow && {
        shadow: layoutItem.shadow,
        shadowColor: layoutItem.shadowColor,
        shadowBlur: layoutItem.shadowBlur,
        shadowOffsetX: layoutItem.shadowOffsetX,
        shadowOffsetY: layoutItem.shadowOffsetY,
        shadowOpacity: layoutItem.shadowOpacity
      })
    }

    // Si le QR code a une couleur différente, regénérer l'image
    if (layoutItem.fill !== originalItem.fill) {
      try {
        const newQRCodeSrc = await generateQRCodeImage(
          originalItem.qrText,
          layoutItem.fill || '#000000',
          originalItem.width || 50
        )
        syncedProperties.src = newQRCodeSrc
      } catch (error) {
        console.error('Erreur lors de la régénération du QR code:', error)
      }
    }

    return syncedProperties
  }

  return layoutItem
}

export const hasAppearanceChanges = (oldObj, newObj) => {
  return OBJECT_PROPERTIES.appearance.some(
    (prop) => JSON.stringify(oldObj[prop]) !== JSON.stringify(newObj[prop])
  )
}
