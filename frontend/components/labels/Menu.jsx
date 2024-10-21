import React, { useState, useEffect } from 'react'
import { faShapes, faTextHeight } from '@fortawesome/free-solid-svg-icons'
import ShapeMenu from './menus/ShapeMenu'
import TextMenu from './menus/TextMenu'
import ParentMenu from './menus/ParentMenu'
import { useCanvas } from '../../context/CanvasContext'

const Menu = ({ onAddCircle, onAddRectangle, onAddText }) => {
  const [showShapes, setShowShapes] = useState(false)
  const [showText, setShowText] = useState(false)

  // Récupération de la sélection d'objets depuis le contexte Canvas
  const { selectedObject } = useCanvas()

  // Active le bouton des formes si une forme est sélectionnée
  useEffect(() => {
    if (selectedObject?.type === 'circle' || selectedObject?.type === 'rect') {
      setShowShapes(true)
      setShowText(false)
    }
  }, [selectedObject])

  // Active le bouton du texte si un texte est sélectionné
  useEffect(() => {
    if (selectedObject?.type === 'i-text') {
      setShowText(true)
      setShowShapes(false)
    }
  }, [selectedObject])

  const toggleShapes = () => {
    setShowText(false) // Ferme le menu texte si ouvert
    setShowShapes((prev) => !prev)
  }

  const toggleText = () => {
    setShowShapes(false) // Ferme le menu formes si ouvert
    setShowText((prev) => !prev)
  }

  return (
    <div className="relative flex items-start p-4">
      {/* Parent Menu pour les formes */}
      <ParentMenu
        icon={faShapes}
        titleOpen="Masquer les formes"
        titleClosed="Afficher les formes"
        isOpen={showShapes} // On garde la logique d'état local
        toggle={toggleShapes}
        size="w-16 h-16"
        iconSize="text-3xl"
      >
        <ShapeMenu onAddCircle={onAddCircle} onAddRectangle={onAddRectangle} />
      </ParentMenu>

      {/* Parent Menu pour le texte avec effet accordéon */}
      <div className={`relative transition-all duration-300 ${showShapes ? 'ml-40' : 'ml-4'}`}>
        <ParentMenu
          icon={faTextHeight}
          titleOpen="Masquer le texte"
          titleClosed="Afficher le texte"
          isOpen={showText} // On garde la logique d'état local
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
