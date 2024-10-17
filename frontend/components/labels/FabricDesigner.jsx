import React from 'react'
import styles from './FabricDesigner.module.css'
import ColorPicker from './texttool/ColorPicker'
import CanvasControl from './CanvasControl'
import ShapeButtons from './ShapeButtons'
import ZoomControl from './ZoomControl'
import { useCanvas } from '../../context/CanvasContext'

export default function FabricDesigner() {
  const {
    canvasRef,
    zoomLevel,
    handleZoomChange,
    onAddCircle,
    onAddRectangle,
    onAddText,
    selectedColor,
    setSelectedColor
  } = useCanvas()

  return (
    <div className={styles.app}>
      <h1>
        FabricJS avec zoom et redimensionnement
      </h1>

      {/* Section pour ajouter des formes et du texte */}
      <ShapeButtons
        onAddCircle={onAddCircle}
        onAddRectangle={onAddRectangle}
        onAddText={onAddText}
      />

      {/* Sélecteur de couleur */}
      <ColorPicker
        color={selectedColor}
        setTextStyle={(color) =>
          setSelectedColor(color)
        }
      />

      {/* Contrôle de zoom */}
      <ZoomControl
        zoomLevel={zoomLevel}
        handleZoomChange={handleZoomChange}
      />

      {/* Conteneur du canevas */}
      <CanvasControl canvasRef={canvasRef} />
    </div>
  )
}
