// frontend/hooks/useFontManagement.js
import { useEffect } from 'react'
import FontFaceObserver from 'fontfaceobserver'
import { loadedFonts } from '../../utils/fontCache' // Import du cache

export default function useFontManagement(canvas, selectedObject, selectedFont) {
  useEffect(() => {
    const applyFontToSelectedObject = async () => {
      if (canvas && selectedObject && ['i-text', 'textbox'].includes(selectedObject.type)) {
        if (!loadedFonts.has(selectedFont)) {
          // Utiliser le cache
          const fontObserver = new FontFaceObserver(selectedFont)
          try {
            await fontObserver.load()
            loadedFonts.add(selectedFont) // Ajouter la police au cache
          } catch (error) {
            console.error(`Erreur lors du chargement de la police ${selectedFont}:`, error)
            return
          }
        }
        selectedObject.set('fontFamily', selectedFont)
        selectedObject.dirty = true
        selectedObject.setCoords()
        canvas.requestRenderAll()
      }
    }
    applyFontToSelectedObject()
  }, [selectedFont, canvas, selectedObject])
}
