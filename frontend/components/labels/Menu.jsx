import React, { useState } from 'react'
import { faShapes, faTextHeight } from '@fortawesome/free-solid-svg-icons'
import ShapeMenu from './menus/ShapeMenu'
import TextMenu from './menus/TextMenu'
import ParentMenu from './menus/ParentMenu'

const Menu = ({ onAddCircle, onAddRectangle, onAddText }) => {
  const [showShapes, setShowShapes] = useState(false)
  const [showText, setShowText] = useState(false)

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
        isOpen={showShapes}
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
