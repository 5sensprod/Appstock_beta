import { useCallback } from 'react'
import * as fabric from 'fabric'
import { loadFont } from '../utils/fontUtils'
import useAddObjectToCanvas from './useAddObjectToCanvas'

const useAddText = (canvas, labelConfig, selectedColor, selectedFont) => {
  const { centerObject } = useAddObjectToCanvas(labelConfig)

  // Propriétés de bordure par défaut
  const defaultStrokeProps = {
    stroke: '#000000',
    strokeWidth: 0,
    strokeUniform: true
  }

  const onAddText = useCallback(async () => {
    const fontSize = labelConfig?.labelWidth / 5 || 16

    try {
      await loadFont(selectedFont)
    } catch (error) {
      console.error('Failed to load font, using fallback.')
    }

    if (!canvas) {
      console.error('Canvas is not initialized.')
      return
    }

    const textBox = new fabric.Textbox('Votre texte ici', {
      fontSize,
      fill: selectedColor || 'black',
      textAlign: 'left',
      fontFamily: selectedFont || 'Lato',
      ...defaultStrokeProps
    })

    textBox.id = Math.random().toString(36).substring(2, 11)

    centerObject(textBox)
    canvas.add(textBox)
    canvas.setActiveObject(textBox)
    canvas.renderAll()
  }, [canvas, labelConfig, selectedColor, selectedFont, centerObject])

  return { onAddText }
}

export default useAddText
