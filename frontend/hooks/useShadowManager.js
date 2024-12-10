// hooks/useShadowManager.js
import { useCallback } from 'react'
import { useCanvas } from '../context/CanvasContext'
import * as fabric from 'fabric'
import { extractObjectProperties } from '../utils/objectPropertiesConfig'

export const DEFAULT_SHADOW = {
  color: '#000000',
  blur: 5,
  offsetX: 5,
  offsetY: 5,
  opacity: 0.5
}

export const useShadowManager = () => {
  const { canvas, selectedObject, dispatchCanvasAction } = useCanvas()

  const handleShadowChange = useCallback(
    (shadowProps) => {
      if (!selectedObject) return

      let currentShadow = selectedObject.shadow
        ? { ...DEFAULT_SHADOW, ...selectedObject.shadow.toObject() }
        : { ...DEFAULT_SHADOW }

      // Mettre à jour les propriétés de l'ombre
      const updatedShadow = { ...currentShadow, ...shadowProps }

      // Créer une nouvelle instance de Shadow
      const newShadow = new fabric.Shadow(updatedShadow)
      selectedObject.set('shadow', newShadow)
      canvas.renderAll()

      // Mettre à jour le state
      dispatchCanvasAction({
        type: 'SET_OBJECT_PROPERTIES',
        payload: {
          shadow: extractObjectProperties(selectedObject, ['shadow'])
        }
      })
    },
    [selectedObject, canvas, dispatchCanvasAction]
  )

  // Obtenir l'ombre actuelle ou les valeurs par défaut
  const getCurrentShadow = useCallback(() => {
    if (!selectedObject) return { ...DEFAULT_SHADOW }
    return selectedObject.shadow
      ? { ...DEFAULT_SHADOW, ...selectedObject.shadow.toObject() }
      : { ...DEFAULT_SHADOW }
  }, [selectedObject])

  return {
    currentShadow: getCurrentShadow(),
    handleShadowChange
  }
}
