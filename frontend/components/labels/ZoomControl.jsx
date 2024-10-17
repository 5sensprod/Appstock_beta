import React from 'react'
import styles from './FabricDesigner.module.css'

export default function ZoomControl({ zoomLevel, handleZoomChange }) {
  return (
    <div className={styles.zoomControl}>
      <label htmlFor="zoom" className="flex items-center space-x-2">
        <span>Zoom :</span>
        <div className="w-12 rounded border bg-gray-100 p-1 text-center">{zoomLevel}x</div>
      </label>
      <input
        type="range"
        id="zoom"
        min="0.75"
        max="5"
        step="0.25"
        value={zoomLevel}
        onChange={handleZoomChange}
        className="mt-2 w-full"
      />
    </div>
  )
}
