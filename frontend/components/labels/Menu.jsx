import React, { useState, useEffect, useRef } from 'react'
import { faShapes, faTextHeight, faImage } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ShapeMenu from './menus/ShapeMenu'
import TextMenu from './menus/TextMenu'
import ImageMenu from './menus/ImageMenu'
import { useCanvas } from '../../context/CanvasContext'

const Menu = () => {
  const [activeMenu, setActiveMenu] = useState(null) // Un seul état pour gérer quel menu est ouvert
  const [menuWidth, setMenuWidth] = useState(0) // Stocker la largeur du menu ouvert
  const menuRef = useRef(null) // Référence pour mesurer la largeur

  // Récupération des méthodes et de la sélection d'objets depuis le contexte Canvas
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
      setMenuWidth(0)
    } else {
      setActiveMenu(menu)
    }
  }

  // Mesurer la largeur du sous-menu et l'appliquer à la marge
  useEffect(() => {
    if (menuRef.current && activeMenu) {
      setMenuWidth(menuRef.current.offsetWidth)
    } else {
      setMenuWidth(0)
    }
  }, [activeMenu])

  return (
    <div className="relative flex items-start gap-4 p-4">
      {/* Bouton et menu pour les formes */}
      <div className="relative" ref={activeMenu === 'shapes' ? menuRef : null}>
        <button
          onClick={() => toggleMenu('shapes')}
          className={`flex items-center justify-center rounded bg-blue-500 p-4 text-white hover:bg-blue-600 ${
            activeMenu === 'shapes' ? 'bg-blue-300' : ''
          }`}
        >
          <FontAwesomeIcon icon={faShapes} className="text-3xl" />
        </button>
        {activeMenu === 'shapes' && (
          <div className="absolute left-full top-0 ml-2" ref={menuRef}>
            <ShapeMenu onAddCircle={onAddCircle} onAddRectangle={onAddRectangle} />
          </div>
        )}
      </div>

      {/* Bouton et menu pour le texte */}
      <div
        className="relative"
        style={{
          marginLeft: activeMenu ? `${menuWidth}px` : '0px',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <button
          onClick={() => toggleMenu('text')}
          className={`flex items-center justify-center rounded bg-blue-500 p-4 text-white hover:bg-blue-600 ${
            activeMenu === 'text' ? 'bg-blue-300' : ''
          }`}
        >
          <FontAwesomeIcon icon={faTextHeight} className="text-3xl" />
        </button>
        {activeMenu === 'text' && (
          <div className="absolute left-full top-0 ml-2" ref={menuRef}>
            <TextMenu onAddText={onAddText} />
          </div>
        )}
      </div>

      {/* Bouton et menu pour les images */}
      <div
        className="relative"
        style={{
          marginLeft: activeMenu ? `${menuWidth}px` : '0px',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <button
          onClick={() => toggleMenu('images')}
          className={`flex items-center justify-center rounded bg-blue-500 p-4 text-white hover:bg-blue-600 ${
            activeMenu === 'images' ? 'bg-blue-300' : ''
          }`}
        >
          <FontAwesomeIcon icon={faImage} className="text-3xl" />
        </button>
        {activeMenu === 'images' && (
          <div className="absolute left-full top-0 ml-2" ref={menuRef}>
            <ImageMenu onAddImage={onAddImage} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Menu
