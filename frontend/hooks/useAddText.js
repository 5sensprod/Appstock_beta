import { useCallback } from 'react'
import * as fabric from 'fabric'
import FontFaceObserver from 'fontfaceobserver'
import useAddObjectToCanvas from './useAddObjectToCanvas'

const useAddText = (canvas, labelConfig, selectedColor, selectedFont) => {
  const { centerObject } = useAddObjectToCanvas(labelConfig)

  const loadAndApplyFont = useCallback(async (fontFamily) => {
    if (!fontFamily) {
      console.warn('No font family provided, skipping font load.')
      return
    }
    const fontObserver = new FontFaceObserver(fontFamily)
    try {
      await fontObserver.load(null, 10000) // 10 secondes timeout
      console.log(`Font ${fontFamily} loaded successfully`)
    } catch (error) {
      console.error(`Error loading font ${fontFamily}:`, error)
    }
  }, [])

  const onAddText = useCallback(async () => {
    const fontSize = labelConfig?.labelWidth / 5 || 16
    await loadAndApplyFont(selectedFont)

    if (!canvas) {
      console.error('Canvas is not initialized.')
      return
    }

    // Création de l'objet texte
    const textBox = new fabric.Textbox('Votre texte ici', {
      fontSize,
      fill: selectedColor || 'black',
      textAlign: 'left',
      fontFamily: selectedFont || 'Lato'
    })

    // Ajout d'un ID unique
    textBox.id = Math.random().toString(36).substring(2, 11)

    // Centrer l'objet et l'ajouter au canvas
    centerObject(textBox)
    canvas.add(textBox)
    canvas.setActiveObject(textBox)
    canvas.renderAll()
  }, [canvas, labelConfig, selectedColor, selectedFont, loadAndApplyFont, centerObject])

  return { onAddText }
}

export default useAddText
