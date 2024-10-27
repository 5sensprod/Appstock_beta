import { useCallback } from 'react'
import * as fabric from 'fabric'
import FontFaceObserver from 'fontfaceobserver'
import useAddObjectToCanvas from './useAddObjectToCanvas'

const useAddText = (canvas, labelConfig, selectedColor, selectedFont) => {
  const { addObjectToCanvas } = useAddObjectToCanvas(canvas, labelConfig)

  const loadAndApplyFont = useCallback(async (fontFamily) => {
    const fontObserver = new FontFaceObserver(fontFamily)
    try {
      await fontObserver.load()
      console.log(`Police ${fontFamily} chargée avec succès`)
    } catch (error) {
      console.error(`Erreur lors du chargement de la police ${fontFamily}:`, error)
    }
  }, [])

  const onAddText = useCallback(async () => {
    const fontSize = labelConfig.labelWidth / 5
    await loadAndApplyFont(selectedFont)

    const textBox = new fabric.Textbox('Votre texte ici', {
      fontSize,
      fill: selectedColor,
      textAlign: 'left',
      fontFamily: selectedFont
    })

    addObjectToCanvas(textBox)
    canvas.renderAll()
  }, [selectedColor, labelConfig, selectedFont, addObjectToCanvas, canvas, loadAndApplyFont])

  const onAddTextCsv = useCallback(
    async (text = 'Votre texte ici') => {
      const fontSize = labelConfig.labelWidth / 5
      await loadAndApplyFont(selectedFont)

      const textBox = new fabric.Textbox(text, {
        fontSize,
        fill: selectedColor,
        textAlign: 'left',
        fontFamily: selectedFont
      })

      addObjectToCanvas(textBox)
      canvas.renderAll()
    },
    [selectedColor, labelConfig, selectedFont, addObjectToCanvas, canvas, loadAndApplyFont]
  )

  return { onAddText, onAddTextCsv }
}

export default useAddText
