import { useCallback } from 'react'
import * as fabric from 'fabric'
import FontFaceObserver from 'fontfaceobserver'
import useAddObjectToCanvas from './useAddObjectToCanvas'

const useAddText = (canvas, labelConfig, selectedColor, selectedFont) => {
  const { addObjectToCanvas } = useAddObjectToCanvas(canvas, labelConfig)

  const onAddText = useCallback(() => {
    const fontSize = labelConfig.labelWidth / 5
    const fontObserver = new FontFaceObserver(selectedFont)

    fontObserver
      .load()
      .then(() => {
        const textBox = new fabric.Textbox('Votre texte ici', {
          fontSize,
          fill: selectedColor,
          textAlign: 'left',
          fontFamily: selectedFont
        })

        addObjectToCanvas(textBox)

        // Force le rendu du canevas
        canvas.renderAll()
      })
      .catch((error) => {
        console.error(`Erreur lors du chargement de la police ${selectedFont}:`, error)
      })
  }, [selectedColor, labelConfig, selectedFont, addObjectToCanvas, canvas])

  const onAddTextCsv = useCallback(
    (text = 'Votre texte ici') => {
      const fontSize = labelConfig.labelWidth / 5

      // Charger la police avant d'ajouter l'élément texte
      const fontObserver = new FontFaceObserver(selectedFont)

      fontObserver
        .load()
        .then(() => {
          const textBox = new fabric.Textbox(text, {
            fontSize,
            fill: selectedColor,
            textAlign: 'left',
            fontFamily: selectedFont
          })

          addObjectToCanvas(textBox)

          // Force le rendu du canevas
          canvas.renderAll()
        })
        .catch((error) => {
          console.error(`Erreur lors du chargement de la police ${selectedFont}:`, error)
        })
    },
    [selectedColor, labelConfig, selectedFont, addObjectToCanvas, canvas]
  )

  return { onAddText, onAddTextCsv }
}

export default useAddText
