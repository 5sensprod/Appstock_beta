/**
 * Hook personnalisé pour gérer les événements du canevas.
 * Ce hook gère les événements de sélection, de mouvement et de redimensionnement
 * des objets sur le canevas. Il met à jour l'objet sélectionné et sa couleur,
 * tout en restreignant le mouvement et le redimensionnement des objets aux limites du canevas.
 *
 * @param {fabric.Canvas} canvas - Instance de Fabric.js du canevas
 * @param {Function} setSelectedObject - Fonction pour définir l'objet sélectionné
 * @param {Function} setSelectedColor - Fonction pour définir la couleur sélectionnée
 */

import { useEffect } from 'react'

const useCanvasEvents = (canvas, setSelectedObject, setSelectedColor) => {
  useEffect(() => {
    if (!canvas) return

    const updateSelectedObject = () => {
      const activeObject = canvas.getActiveObject()
      setSelectedObject(activeObject)
      if (activeObject && activeObject.fill) {
        setSelectedColor(activeObject.fill)
      }
    }

    const restrictObjectMovement = (e) => {
      const obj = e.target
      obj.setCoords()
      const boundingRect = obj.getBoundingRect()
      const canvasWidth = canvas.getWidth()
      const canvasHeight = canvas.getHeight()

      if (boundingRect.left < 0) obj.left -= boundingRect.left
      if (boundingRect.top < 0) obj.top -= boundingRect.top
      if (boundingRect.left + boundingRect.width > canvasWidth)
        obj.left -= boundingRect.left + boundingRect.width - canvasWidth
      if (boundingRect.top + boundingRect.height > canvasHeight)
        obj.top -= boundingRect.top + boundingRect.height - canvasHeight

      obj.setCoords()
    }

    // Écouter les événements de sélection et mouvement
    canvas.on('selection:created', updateSelectedObject)
    canvas.on('selection:updated', updateSelectedObject)
    canvas.on('selection:cleared', () => {
      setSelectedObject(null)
      setSelectedColor('#000000') // Remettre à la couleur par défaut
    })

    canvas.on('object:moving', restrictObjectMovement)
    canvas.on('object:scaling', restrictObjectMovement)

    // Nettoyer les événements lors du démontage
    return () => {
      canvas.off('selection:created', updateSelectedObject)
      canvas.off('selection:updated', updateSelectedObject)
      canvas.off('selection:cleared')
      canvas.off('object:moving', restrictObjectMovement)
      canvas.off('object:scaling', restrictObjectMovement)
    }
  }, [canvas, setSelectedObject, setSelectedColor])
}

export default useCanvasEvents
