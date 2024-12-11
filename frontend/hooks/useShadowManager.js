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
    (shadowProps, isClosing = false) => {
      // Ajout du paramètre isClosing ici
      if (!selectedObject) return

      const currentShadow = selectedObject.shadow
        ? { ...selectedObject.shadow.toObject() }
        : { ...DEFAULT_SHADOW }

      // Pour l'opacité, s'assurer que la valeur est un nombre
      // if ('opacity' in shadowProps) {
      //   shadowProps.opacity = parseFloat(shadowProps.opacity)
      // }

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
          shadow: newShadow.toObject()
        }
      })
      // Si on ferme le menu, déclencher object:modified
      if (isClosing) {
        canvas.fire('object:modified')
      }
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
