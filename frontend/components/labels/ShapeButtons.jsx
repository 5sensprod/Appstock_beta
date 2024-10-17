import React from 'react'
import styles from './FabricDesigner.module.css'

export default function ShapeButtons({
  onAddCircle,
  onAddRectangle,
  onAddText
}) {
  return (
    <div className={styles.buttonContainer}>
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
    </div>
  )
}
