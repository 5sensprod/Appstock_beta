import React from 'react'
// import styles from './FabricDesigner.module.css'

export default function ZoomControl({ zoomLevel, handleZoomChange }) {
  return (
    <div className="p-4">
      <label htmlFor="zoom" className="mb-2 block">
        Zoom: {zoomLevel.toFixed(2)}x
      </label>
      <input
        type="range"
        id="zoom"
        min="0.5"
        max="5"
        step="0.1"
        value={zoomLevel}
        onChange={handleZoomChange}
      />
    </div>
  )
}
