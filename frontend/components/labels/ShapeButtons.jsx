import React from 'react'
import { faCircle, faSquare, faTextHeight } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../ui/IconButton'
import styles from './FabricDesigner.module.css'

export default function ShapeButtons({ onAddCircle, onAddRectangle, onAddText }) {
  return (
    <div className={styles.buttonContainer}>
      <IconButton
        onClick={onAddCircle}
        icon={faCircle}
        title="Ajouter un cercle"
        className={styles.button}
      />
      <IconButton
        onClick={onAddRectangle}
        icon={faSquare}
        title="Ajouter un rectangle"
        className={styles.button}
      />
      <IconButton
        onClick={onAddText}
        icon={faTextHeight}
        title="Ajouter du texte"
        className={styles.button}
      />
    </div>
  )
}
