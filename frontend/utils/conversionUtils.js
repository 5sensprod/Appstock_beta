export const DPI = 72
export const mmToPx = (mm) => (mm / 25.4) * DPI

export const rgbToHex = (rgb) => {
  if (!rgb || typeof rgb !== 'string') {
    return '#000000' // Valeur par défaut si l'entrée est invalide
  }

  if (rgb.charAt(0) === '#') {
    return rgb // Si déjà en hexadécimal, retourner tel quel
  }

  // Convertir le format `rgb(r, g, b)` en hexadécimal
  const rgbValues = rgb.match(/\d+/g)
  if (!rgbValues || rgbValues.length < 3) {
    return '#000000' // Valeur par défaut en cas d'erreur de parsing
  }

  const hex = rgbValues
    .slice(0, 3)
    .map((value) => parseInt(value).toString(16).padStart(2, '0'))
    .join('')

  return `#${hex}`
}
