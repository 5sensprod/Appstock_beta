import { useCallback } from 'react'

// Conversion mm -> pixels
const mmToPx = (mm) => (mm / 25.4) * 72

const useUpdateCanvasSize = (canvas, labelConfig, setLabelConfig, setZoomLevel) => {
  // Assurez-vous de passer setZoomLevel ici
  const updateCanvasSize = useCallback(
    (newSize) => {
      if (canvas) {
        const newWidthPx = mmToPx(newSize.labelWidth || labelConfig.labelWidth)
        const newHeightPx = mmToPx(newSize.labelHeight || labelConfig.labelHeight)

        // Mettre à jour la configuration du label
        setLabelConfig((prevConfig) => ({
          ...prevConfig,
          ...newSize
        }))

        // Réinitialiser le niveau de zoom à 1
        console.log('setZoomLevel is being called with 1') // Log pour vérifier
        canvas.setZoom(1)
        setZoomLevel(1) // Assurez-vous que setZoomLevel est passé correctement

        // Réinitialiser la taille du canevas
        canvas.setWidth(newWidthPx)
        canvas.setHeight(newHeightPx)

        // Remettre les objets à leur position et échelle d'origine
        canvas.getObjects().forEach((obj) => {
          obj.scaleX = obj.originalScaleX || obj.scaleX
          obj.scaleY = obj.originalScaleY || obj.scaleY
          obj.left = obj.originalLeft || obj.left
          obj.top = obj.originalTop || obj.top
          obj.setCoords() // Mettre à jour les coordonnées
        })

        canvas.renderAll() // Redessiner le canevas
      }
    },
    [canvas, labelConfig, setLabelConfig, setZoomLevel] // setZoomLevel ajouté comme dépendance
  )

  return updateCanvasSize
}

export default useUpdateCanvasSize
