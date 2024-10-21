import React, { useState, useEffect } from 'react'
import { faShapes, faTextHeight } from '@fortawesome/free-solid-svg-icons'
import ShapeMenu from './menus/ShapeMenu'
import TextMenu from './menus/TextMenu'
import ParentMenu from './menus/ParentMenu'
import { useCanvas } from '../../context/CanvasContext'

const Menu = () => {
  const [showShapes, setShowShapes] = useState(false)
  const [showText, setShowText] = useState(false)

  // Récupération des méthodes et de la sélection d'objets depuis le contexte Canvas
  const { onAddCircle, onAddRectangle, onAddText, selectedObject } = useCanvas()

  useEffect(() => {
    if (selectedObject?.type === 'circle' || selectedObject?.type === 'rect') {
      setShowShapes(true)
      setShowText(false)
    }
  }, [selectedObject])

  useEffect(() => {
    if (selectedObject?.type === 'i-text') {
      setShowText(true)
      setShowShapes(false)
    }
  }, [selectedObject])

  const toggleShapes = () => {
    setShowText(false)
    setShowShapes((prev) => !prev)
  }

  const toggleText = () => {
    setShowShapes(false)
    setShowText((prev) => !prev)
  }

  return (
    <div className="relative flex items-start gap-4 p-4">
      <ParentMenu
        icon={faShapes}
        titleOpen="Masquer les formes"
        titleClosed="Afficher les formes"
        isOpen={showShapes}
        toggle={toggleShapes}
        size="w-16 h-16"
        iconSize="text-3xl"
      >
        <ShapeMenu onAddCircle={onAddCircle} onAddRectangle={onAddRectangle} />
      </ParentMenu>

      <div className={`relative transition-all duration-300 ${showShapes ? 'ml-40' : 'ml-4'}`}>
        <ParentMenu
          icon={faTextHeight}
          titleOpen="Masquer le texte"
          titleClosed="Afficher le texte"
          isOpen={showText}
          toggle={toggleText}
          size="w-16 h-16"
          iconSize="text-3xl"
        >
          <TextMenu onAddText={onAddText} />
        </ParentMenu>
      </div>
    </div>
  )
}

export default Menu
