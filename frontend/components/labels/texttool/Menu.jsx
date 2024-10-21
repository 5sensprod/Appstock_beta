import React, { useState } from 'react'
import { faShapes, faTextHeight } from '@fortawesome/free-solid-svg-icons'
import ShapeMenu from '../menus/ShapeMenu'
import TextMenu from '../menus/TextMenu'
import IconButton from '../../ui/IconButton'

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
      {/* Section du bouton "Shapes" */}
      <div className="relative">
        <IconButton
          onClick={toggleShapes}
          icon={faShapes}
          title={showShapes ? 'Masquer les formes' : 'Afficher les formes'}
          isActive={showShapes}
          size="w-16 h-16"
          iconSize="text-3xl"
        />
        {/* Sous-menu "Shapes" avec une animation de translation */}
        <div
          className={`absolute left-full top-0 ml-2 transition-all duration-500 ease-in-out${
            showShapes ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
          }`}
        >
          <ShapeMenu onAddCircle={onAddCircle} onAddRectangle={onAddRectangle} />
        </div>
      </div>

      {/* Section du bouton "Text" */}
      <div className={`relative transition-all duration-300 ${showShapes ? 'ml-40' : 'ml-4'}`}>
        <IconButton
          onClick={toggleText}
          icon={faTextHeight}
          title={showText ? 'Masquer le texte' : 'Afficher le texte'}
          isActive={showText}
          size="w-16 h-16"
          iconSize="text-3xl"
        />
        {/* Sous-menu "Text" avec une animation de translation */}
        <div
          className={`absolute left-full top-0 ml-2 transition-all duration-500 ease-in-out${
            showText ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
          }`}
        >
          <TextMenu onAddText={onAddText} />
        </div>
      </div>
    </div>
  )
}

export default Menu
