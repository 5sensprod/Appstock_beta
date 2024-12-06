// utils/objectPropertiesConfig.js

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
    'gradientType',
    'gradientColors',
    'gradientDirection',
    'fill' // Ajout de fill ici aussi car il peut être affecté par le gradient
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
  text: ['fontSize', 'fontFamily', 'fontStyle', 'fontWeight', 'text'],
  qr: ['isQRCode', 'qrText', 'src']
}

export const TYPE_PROPERTY_GROUPS = {
  rect: ['basic', 'appearance', 'stroke'],
  circle: ['basic', 'appearance', 'stroke'],
  'i-text': ['basic', 'appearance', 'stroke', 'text'],
  textbox: ['basic', 'appearance', 'stroke', 'text'],
  image: ['basic', 'appearance'],
  qrcode: ['basic', 'qr']
}

export const extractObjectProperties = (obj, propertyGroups = ['basic'], scaleFactor = 1) => {
  const props = {}

  propertyGroups.forEach((group) => {
    if (OBJECT_PROPERTIES[group]) {
      OBJECT_PROPERTIES[group].forEach((prop) => {
        if (obj[prop] !== undefined) {
          // Appliquer le scaleFactor aux propriétés qui en ont besoin
          if (prop === 'strokeWidth') {
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

export const hasAppearanceChanges = (oldObj, newObj) => {
  return OBJECT_PROPERTIES.appearance.some(
    (prop) => JSON.stringify(oldObj[prop]) !== JSON.stringify(newObj[prop])
  )
}
