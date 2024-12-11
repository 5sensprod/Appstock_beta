// hooks/useShadowManager.js
import { useCallback } from 'react'
import { useCanvas } from '../context/CanvasContext'
import * as fabric from 'fabric'
import { extractObjectProperties } from '../utils/objectPropertiesConfig'

// hooks/useShadowManager.js
export const SHADOW_PROPERTIES = {
  color: '#000000',
  blur: 5,
  offsetX: 5,
  offsetY: 5,
  opacity: 0.5,
  affectStroke: false,
  nonScaling: false
}

export const useShadowManager = () => {
  const { canvas, selectedObject, dispatchCanvasAction } = useCanvas()

  const handleShadowChange = useCallback(
    (shadowProps, isClosing = false) => {
      if (!selectedObject) return

      // Obtenir l'état actuel de l'ombre ou utiliser les valeurs par défaut
      const currentShadow = {
        ...SHADOW_PROPERTIES,
        ...(selectedObject.shadow ? selectedObject.shadow.toObject() : {})
      }

      // Mettre à jour seulement la propriété modifiée
      const updates = { ...shadowProps }

      // Créer la nouvelle ombre avec les valeurs mises à jour
      const newShadow = new fabric.Shadow({
        ...currentShadow,
        ...updates
      })

      selectedObject.set('shadow', newShadow)
      canvas.renderAll()

      dispatchCanvasAction({
        type: 'SET_SHADOW_PROPERTIES',
        payload: updates
      })

      if (isClosing) {
        canvas.fire('object:modified')
      }
    },
    [selectedObject, canvas, dispatchCanvasAction]
  )

  // Toujours retourner un objet complet avec toutes les propriétés
  const getCurrentShadow = useCallback(() => {
    if (!selectedObject) return SHADOW_PROPERTIES

    const currentShadow = selectedObject.shadow ? selectedObject.shadow.toObject() : {}
    return {
      ...SHADOW_PROPERTIES,
      ...currentShadow
    }
  }, [selectedObject])

  return {
    currentShadow: getCurrentShadow(),
    handleShadowChange
  }
}
