import React from 'react'
import styles from './FabricDesigner.module.css'

export default function CanvasControl({ canvasRef }) {
  return (
    <div className={styles.canvasContainer}>
      <canvas ref={canvasRef} className={styles.sampleCanvas} />
    </div>
  )
}
