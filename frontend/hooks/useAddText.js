import { useCallback } from 'react'
import * as fabric from 'fabric'
import FontFaceObserver from 'fontfaceobserver'
import useAddObjectToCanvas from './useAddObjectToCanvas'

const useAddText = (canvas, labelConfig, selectedColor, selectedFont) => {
  const { addObjectToCanvas } = useAddObjectToCanvas(canvas, labelConfig)

  const loadAndApplyFont = useCallback(async (fontFamily) => {
    if (!fontFamily) {
      console.warn('No font family provided, skipping font load.')
      return
    }
    const fontObserver = new FontFaceObserver(fontFamily)
    try {
      // Increase timeout to 10 seconds (or as needed)
      await fontObserver.load(null, 10000) // 10000ms = 10 seconds
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

    const textBox = new fabric.Textbox('Votre texte ici', {
      fontSize,
      fill: selectedColor || 'black', // Fallback color
      textAlign: 'left',
      fontFamily: selectedFont || 'Lato' // Fallback font
    })

    addObjectToCanvas(textBox)
    canvas.renderAll()
  }, [selectedColor, labelConfig, selectedFont, addObjectToCanvas, canvas, loadAndApplyFont])

  const onAddTextCsv = useCallback(
    async (text = 'Votre texte ici', fontFamily = 'Lato', fillColor = 'black', fontSize = 16) => {
      await loadAndApplyFont(fontFamily)

      if (!canvas) {
        console.error('Canvas is not initialized.')
        return null
      }

      const textBox = new fabric.Textbox(text, {
        fontSize,
        fill: fillColor,
        textAlign: 'left',
        fontFamily
      })

      addObjectToCanvas(textBox)
      canvas.renderAll()

      return textBox // Retourner le textBox créé
    },
    [addObjectToCanvas, canvas, loadAndApplyFont]
  )

  return { onAddText, onAddTextCsv }
}

export default useAddText
