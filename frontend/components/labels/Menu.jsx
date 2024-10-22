import React, { useState, useEffect } from 'react'
import { faShapes, faTextHeight, faImage } from '@fortawesome/free-solid-svg-icons'
import ShapeMenu from './menus/ShapeMenu'
import TextMenu from './menus/TextMenu'
import ImageMenu from './menus/ImageMenu'
import ParentMenu from './menus/ParentMenu'
import { useCanvas } from '../../context/CanvasContext'

const Menu = () => {
  const [openMenu, setOpenMenu] = useState(null)
  const { onAddCircle, onAddRectangle, onAddText, onAddImage, selectedObject } = useCanvas()

  useEffect(() => {
    if (selectedObject?.type === 'circle' || selectedObject?.type === 'rect') {
      setOpenMenu('shapes')
    } else if (selectedObject?.type === 'i-text') {
      setOpenMenu('text')
    }
  }, [selectedObject])

  const handleMenuToggle = (menuName) => {
    // Si on clique sur le même menu, on le ferme, sinon on l'ouvre
    setOpenMenu((currentMenu) => (currentMenu === menuName ? null : menuName))
  }

  return (
    <div className="relative flex flex-row items-start gap-4 p-4">
      {/* Menu pour les formes */}
      <ParentMenu
        icon={faShapes}
        titleOpen="Masquer les formes"
        titleClosed="Afficher les formes"
        isOpen={openMenu === 'shapes'}
        toggle={() => handleMenuToggle('shapes')}
        size="w-16 h-16"
        iconSize="text-3xl"
      >
        <ShapeMenu onAddCircle={onAddCircle} onAddRectangle={onAddRectangle} />
      </ParentMenu>

      {/* Menu pour le texte */}
      <ParentMenu
        icon={faTextHeight}
        titleOpen="Masquer le texte"
        titleClosed="Afficher le texte"
        isOpen={openMenu === 'text'}
        toggle={() => handleMenuToggle('text')}
        size="w-16 h-16"
        iconSize="text-3xl"
      >
        <TextMenu onAddText={onAddText} />
      </ParentMenu>

      {/* Menu pour les images */}
      <ParentMenu
        icon={faImage}
        titleOpen="Masquer les images"
        titleClosed="Afficher les images"
        isOpen={openMenu === 'images'}
        toggle={() => handleMenuToggle('images')}
        size="w-16 h-16"
        iconSize="text-3xl"
      >
        <ImageMenu onAddImage={onAddImage} />
      </ParentMenu>
    </div>
  )
}

export default Menu
