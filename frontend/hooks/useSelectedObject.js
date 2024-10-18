/**
 * Hook personnalisé pour gérer la couleur de l'objet sélectionné.
 * Ce hook met à jour la couleur de l'objet actif sur le canevas chaque fois que
 * l'utilisateur modifie la couleur sélectionnée.
 *
 * @param {fabric.Canvas} canvas - Instance de Fabric.js du canevas
 * @param {fabric.Object|null} selectedObject - L'objet actuellement sélectionné sur le canevas
 * @param {string} selectedColor - La couleur actuellement sélectionnée par l'utilisateur
 */

import { useEffect } from 'react'

const useSelectedObject = (canvas, selectedObject, selectedColor) => {
  useEffect(() => {
    if (selectedObject && 'set' in selectedObject) {
      selectedObject.set('fill', selectedColor) // Mettre à jour la couleur de l'objet
      canvas.renderAll()
    }
  }, [selectedColor, selectedObject, canvas])
}

export default useSelectedObject
