import React from 'react'
import styles from './FabricDesigner.module.css'
import { useCanvas } from '../../context/CanvasContext'

export default function CanvasControl() {
  const { canvasRef } = useCanvas() // Récupère canvasRef du contexte

  return (
    <div className={styles.canvasContainer}>
      <canvas ref={canvasRef} className={styles.sampleCanvas} />
    </div>
  )
}
