import { useCallback } from 'react'
import { mmToPx } from '../utils/conversionUtils'

const useAddObjectToCanvas = (canvas, labelConfig) => {
  const addObjectToCanvas = useCallback(
    (object) => {
      if (!canvas) return

      const centerX = mmToPx(labelConfig.labelWidth / 2)
      const centerY = mmToPx(labelConfig.labelHeight / 2)

      object.set({
        left: centerX - object.getScaledWidth() / 2,
        top: centerY - object.getScaledHeight() / 2
      })

      canvas.add(object)
      canvas.setActiveObject(object)
      canvas.renderAll()
    },
    [canvas, labelConfig]
  )

  const onDeleteObject = useCallback(() => {
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      canvas.remove(activeObject) // Supprimer l'objet actif du canevas
      canvas.discardActiveObject() // Désélectionner l'objet
      canvas.renderAll() // Re-rendu du canevas
    }
  }, [canvas])

  return { addObjectToCanvas, onDeleteObject }
}

export default useAddObjectToCanvas
