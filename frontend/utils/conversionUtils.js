export const mmToPx = (mm) => (mm / 25.4) * 72

export const rgbToHex = (rgb) => {
  if (rgb.charAt(0) === '#') {
    return rgb // Si déjà en hex, renvoyer la couleur telle quelle
  }

  // Si la couleur est en format `rgb(r, g, b)`, la convertir en hex
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
