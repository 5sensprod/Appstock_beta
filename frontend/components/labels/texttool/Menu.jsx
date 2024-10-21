import React, { useState } from 'react'
import { faCircle, faSquare } from '@fortawesome/free-solid-svg-icons'
import ShapeButtons from '../ShapeButtons'
import IconButton from '../../ui/IconButton'
import styles from './Menu.module.css'

const Menu = ({ onAddCircle, onAddRectangle, onAddText }) => {
  const [showShapes, setShowShapes] = useState(false)

  const toggleShapes = () => {
    setShowShapes((prev) => !prev)
  }

  return (
    <div className={styles.menuContainer}>
      <IconButton
        onClick={toggleShapes}
        icon={showShapes ? faCircle : faSquare}
        title={showShapes ? 'Masquer les formes' : 'Afficher les formes'}
        className={styles.shapeButton}
      />

      {showShapes && (
        <ShapeButtons
          onAddCircle={onAddCircle}
          onAddRectangle={onAddRectangle}
          onAddText={onAddText}
        />
      )}
    </div>
  )
}

export default Menu
