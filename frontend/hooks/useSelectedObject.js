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
