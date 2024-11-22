// hooks/useCanvasObjectActions.js
import useAddObjectToCanvas from './useAddObjectToCanvas'
import useAddShape from './useAddShape'
import useAddText from './useAddText'
import useAddImage from './useAddImage'
import useAddQRCode from './useAddQRCode'

const useCanvasObjectActions = (canvas, labelConfig, selectedColor, selectedFont) => {
  const { addObjectToCanvas, onDeleteObject } = useAddObjectToCanvas(canvas, labelConfig)

  // Centralise l'ajout de formes
  const { onAddCircle, onAddRectangle } = useAddShape(
    canvas,
    labelConfig,
    selectedColor,
    addObjectToCanvas
  )

  // Centralise l'ajout de texte
  const { onAddText } = useAddText(
    canvas,
    labelConfig,
    selectedColor,
    selectedFont,
    addObjectToCanvas
  )

  // Centralise l'ajout d'images
  const onAddImage = useAddImage(canvas, labelConfig, addObjectToCanvas)

  // Centralise l'ajout de QR Codes
  const { onAddQrCode, onUpdateQrCode } = useAddQRCode(
    canvas,
    labelConfig,
    selectedColor,
    addObjectToCanvas
  )

  return {
    addObjectToCanvas,
    onDeleteObject,
    onAddCircle,
    onAddRectangle,
    onAddText,
    onAddImage,
    onAddQrCode,
    onUpdateQrCode
  }
}

export default useCanvasObjectActions
