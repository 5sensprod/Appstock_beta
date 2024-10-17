import React from 'react'
import styles from './FabricDesigner.module.css'

export default function ZoomControl({
  zoomLevel,
  handleZoomChange
}) {
  return (
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
  )
}
