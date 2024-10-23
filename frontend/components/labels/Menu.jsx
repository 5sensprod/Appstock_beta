import React, { useState, useEffect } from 'react'
import { faShapes, faTextHeight, faImage } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../ui/IconButton'
import ShapeMenu from './menus/ShapeMenu'
import TextMenu from './menus/TextMenu'
import ImageMenu from './menus/ImageMenu'
import { useCanvas } from '../../context/CanvasContext'

const Menu = () => {
  const [activeMenu, setActiveMenu] = useState(null) // Un seul état pour gérer quel menu est ouvert

  // Largeurs fixes pour chaque sous-menu
  const shapeMenuWidth = 135 // Largeur du ShapeMenu (en pixels)
  const textMenuWidth = 100 // Largeur du TextMenu (en pixels)
  const imageMenuWidth = 275 // Largeur du ImageMenu (en pixels)

  const { onAddCircle, onAddRectangle, onAddText, onAddImage, selectedObject } = useCanvas()

  useEffect(() => {
    if (selectedObject?.type === 'circle' || selectedObject?.type === 'rect') {
      setActiveMenu('shapes')
    } else if (selectedObject?.type === 'i-text') {
      setActiveMenu('text')
    } else if (selectedObject?.type === 'image') {
      setActiveMenu('images')
    } else {
      setActiveMenu(null)
    }
  }, [selectedObject])

  const toggleMenu = (menu) => {
    if (activeMenu === menu) {
      setActiveMenu(null)
    } else {
      setActiveMenu(menu)
    }
  }

  return (
    <div className="relative flex items-start gap-4 p-4">
      {/* Bouton et menu pour les formes */}
      <div className="relative">
        <IconButton
          onClick={() => toggleMenu('shapes')}
          icon={faShapes}
          title="Afficher les formes"
          className={`${activeMenu === 'shapes' ? 'bg-blue-300' : 'bg-blue-500'}`} // Changer de couleur si le menu est actif
          size="w-16 h-16" // Taille du bouton
          iconSize="text-3xl" // Taille de l'icône
        />
        {activeMenu === 'shapes' && (
          <div
            className="absolute left-full top-0 ml-2"
            style={{ width: `${shapeMenuWidth}px` }} // Largeur fixe du sous-menu "shapes"
          >
            <ShapeMenu onAddCircle={onAddCircle} onAddRectangle={onAddRectangle} />
          </div>
        )}
      </div>

      {/* Bouton et menu pour le texte */}
      <div
        className="relative"
        style={{
          marginLeft: activeMenu === 'shapes' ? `${shapeMenuWidth}px` : '0px',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <IconButton
          onClick={() => toggleMenu('text')}
          icon={faTextHeight}
          title="Afficher le texte"
          className={`${activeMenu === 'text' ? 'bg-blue-300' : 'bg-blue-500'}`} // Changer de couleur si le menu est actif
          size="w-16 h-16"
          iconSize="text-3xl"
        />
        {activeMenu === 'text' && (
          <div
            className="absolute left-full top-0 ml-2"
            style={{ width: `${textMenuWidth}px` }} // Largeur fixe du sous-menu "text"
          >
            <TextMenu onAddText={onAddText} />
          </div>
        )}
      </div>

      {/* Bouton et menu pour les images */}
      <div
        className="relative"
        style={{
          marginLeft: activeMenu === 'text' ? `${textMenuWidth}px` : '0px',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <IconButton
          onClick={() => toggleMenu('images')}
          icon={faImage}
          title="Afficher les images"
          className={`${activeMenu === 'images' ? 'bg-blue-300' : 'bg-blue-500'}`} // Changer de couleur si le menu est actif
          size="w-16 h-16"
          iconSize="text-3xl"
        />
        {activeMenu === 'images' && (
          <div
            className="absolute left-full top-0 ml-2"
            style={{ width: `${imageMenuWidth}px` }} // Largeur fixe du sous-menu "images"
          >
            <ImageMenu onAddImage={onAddImage} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Menu
