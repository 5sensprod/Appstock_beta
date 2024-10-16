import React, {
  useEffect,
  useCallback
} from 'react'
import DraggableText from './texttool/DraggableText'

const LabelPreview = ({
  labelConfig,
  zoomLevel,
  textElements,
  textOptionsVisible
}) => {
  const updateLabel = useCallback(() => {
    const labelCanvas = document.getElementById(
      'labelCanvas'
    )
    const { labelWidth, labelHeight } =
      labelConfig

    if (labelCanvas) {
      // Calcul du facteur de zoom
      const scale = zoomLevel / 100

      // Appliquer le zoom en ajustant les dimensions du canevas
      labelCanvas.style.width = `${labelWidth * scale}mm`
      labelCanvas.style.height = `${labelHeight * scale}mm`

      // Centrer l'étiquette dans son conteneur
      labelCanvas.style.transform = `translate(-50%, -50%) scale(${scale})`
    }
  }, [labelConfig, zoomLevel])

  useEffect(() => {
    updateLabel()
  }, [updateLabel])

  return (
    <div className="relative mb-4 h-96 w-full overflow-hidden border border-gray-300">
      <div
        id="labelCanvas"
        className="absolute left-1/2 top-1/2 border border-gray-500"
        style={{
          transformOrigin: 'center',
          overflow: 'hidden'
        }}
      >
        {textElements.map((element) => (
          <DraggableText
            key={element.id}
            textStyle={element.style}
            textOptionsVisible={
              textOptionsVisible
            }
            content={element.content}
            zoomLevel={zoomLevel} // Passer zoomLevel ici pour ajuster
          />
        ))}
      </div>
    </div>
  )
}

export default LabelPreview
