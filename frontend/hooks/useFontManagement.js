// hooks/useFontManagement.js
import { useEffect } from 'react'
import FontFaceObserver from 'fontfaceobserver'

export default function useFontManagement(canvas, selectedObject, selectedFont) {
  useEffect(() => {
    const applyFontToSelectedObject = async () => {
      if (canvas && selectedObject && ['i-text', 'textbox'].includes(selectedObject.type)) {
        const fontObserver = new FontFaceObserver(selectedFont)
        try {
          await fontObserver.load()
          selectedObject.set('fontFamily', selectedFont)
          selectedObject.dirty = true
          selectedObject.setCoords()
          canvas.requestRenderAll()
        } catch (error) {
          console.error(`Erreur lors du chargement de la police ${selectedFont}:`, error)
        }
      }
    }
    applyFontToSelectedObject()
  }, [selectedFont, canvas, selectedObject])
}
