import React, { useContext } from 'react'
import styles from './FabricDesigner.module.css'
import ColorPicker from './texttool/ColorPicker'
import { CanvasContext } from '../../context/CanvasContext'

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
  } = useContext(CanvasContext)

  return (
    <div className={styles.app}>
      <h1>
        FabricJS avec zoom et redimensionnement
      </h1>
      <button
        onClick={onAddCircle}
        className={styles.button}
      >
        Ajouter un cercle
      </button>
      <button
        onClick={onAddRectangle}
        className={styles.button}
      >
        Ajouter un rectangle
      </button>
      <button
        onClick={onAddText}
        className={styles.button}
      >
        Ajouter du texte
      </button>
      <ColorPicker
        color={selectedColor}
        setTextStyle={(color) =>
          setSelectedColor(color)
        }
      />

      {/* Contrôle du zoom */}
      <div className={styles.zoomControl}>
        <label htmlFor="zoom">
          Zoom: {zoomLevel}x
        </label>
        <input
          type="range"
          id="zoom"
          min="0.5"
          max="3"
          step="0.1"
          value={zoomLevel}
          onChange={handleZoomChange}
        />
      </div>

      {/* Conteneur du canevas */}
      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          className={styles.sampleCanvas}
        />
      </div>
    </div>
  )
}
