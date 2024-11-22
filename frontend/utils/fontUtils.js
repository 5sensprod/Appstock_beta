// utils/fontUtils.js
import FontFaceObserver from 'fontfaceobserver'

export const loadFont = async (fontFamily) => {
  if (!fontFamily) {
    console.warn('No font family provided, skipping font load.')
    return
  }
  const fontObserver = new FontFaceObserver(fontFamily)
  try {
    await fontObserver.load(null, 10000) // 10-second timeout
    console.log(`Font ${fontFamily} loaded successfully`)
  } catch (error) {
    console.error(`Error loading font ${fontFamily}:`, error)
    throw error
  }
}
