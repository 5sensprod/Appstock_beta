import { useCallback } from 'react'
import { useCanvas } from '../context/CanvasContext'
import * as fabric from 'fabric'

export const SHADOW_PROPERTIES = {
  color: 'rgba(0,0,0,0.5)',
  blur: 5,
  offsetX: 5,
  offsetY: 5,
  opacity: 0.5,
  affectStroke: false,
  nonScaling: false
}

// Fonction utilitaire pour convertir une couleur en RGBA
const convertToRGBA = (color, opacity) => {
  // Si la couleur est déjà en rgba, extraire les composantes
  if (color.startsWith('rgba')) {
    const values = color.match(/[\d.]+/g)
    if (values && values.length >= 3) {
      return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${opacity})`
    }
  }

  // Si la couleur est en hex
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  // Par défaut retourner du noir avec l'opacité donnée
  return `rgba(0, 0, 0, ${opacity})`
}

// Fonction utilitaire pour extraire l'opacité d'une couleur RGBA
const extractOpacityFromRGBA = (color) => {
  if (color && color.startsWith('rgba')) {
    const matches = color.match(/[\d.]+/g)
    if (matches && matches.length >= 4) {
      return parseFloat(matches[3])
    }
  }
  return 0.5 // Valeur par défaut si on ne peut pas extraire l'opacité
}

export const useShadowManager = () => {
  const { canvas, selectedObject, dispatchCanvasAction } = useCanvas()

  const handleShadowChange = useCallback(
    (shadowProps) => {
      if (!selectedObject || !canvas) return

      const currentProps = selectedObject.shadow
        ? { ...selectedObject.shadow.toObject() }
        : { ...SHADOW_PROPERTIES }

      let newProps = { ...currentProps }

      // Gérer l'opacité en modifiant la couleur RGBA
      if ('opacity' in shadowProps) {
        const opacity = shadowProps.opacity
        newProps.opacity = opacity
        newProps.color = convertToRGBA(currentProps.color, opacity)
      }

      // Gérer le changement de couleur
      if ('color' in shadowProps) {
        const opacity = newProps.opacity || currentProps.opacity || 0.5
        newProps.color = convertToRGBA(shadowProps.color, opacity)
      }

      // Mettre à jour les autres propriétés
      if ('blur' in shadowProps) newProps.blur = shadowProps.blur
      if ('offsetX' in shadowProps) newProps.offsetX = shadowProps.offsetX
      if ('offsetY' in shadowProps) newProps.offsetY = shadowProps.offsetY

      // Créer une nouvelle instance d'ombre
      const newShadow = new fabric.Shadow(newProps)

      // Appliquer l'ombre
      selectedObject.set('shadow', newShadow)
      selectedObject.setCoords()
      canvas.renderAll()

      // Mettre à jour le state
      dispatchCanvasAction({
        type: 'SET_SHADOW_PROPERTIES',
        payload: newProps
      })
    },
    [selectedObject, canvas, dispatchCanvasAction]
  )

  const getCurrentShadow = useCallback(() => {
    if (!selectedObject || !selectedObject.shadow) {
      return SHADOW_PROPERTIES
    }

    const shadow = selectedObject.shadow.toObject()

    // Extraire l'opacité de la couleur RGBA
    const opacity = extractOpacityFromRGBA(shadow.color)

    return {
      ...SHADOW_PROPERTIES,
      ...shadow,
      opacity // Utiliser l'opacité extraite de la couleur
    }
  }, [selectedObject])

  return {
    currentShadow: getCurrentShadow(),
    handleShadowChange
  }
}
