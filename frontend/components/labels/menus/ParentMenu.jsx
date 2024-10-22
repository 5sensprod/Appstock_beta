import React, { useRef, useEffect, useState } from 'react'
import IconButton from '../../ui/IconButton'

const ParentMenu = ({ icon, titleOpen, titleClosed, isOpen, toggle, size, iconSize, children }) => {
  const [menuWidth, setMenuWidth] = useState(0)
  const contentRef = useRef(null)

  // Calculer la largeur du contenu lors du montage et des modifications
  useEffect(() => {
    if (contentRef.current) {
      setMenuWidth(contentRef.current.scrollWidth) // Mesure la largeur du contenu
    }
  }, [children])

  return (
    <div className="relative inline-flex items-center">
      <IconButton
        onClick={toggle}
        icon={icon}
        title={isOpen ? titleOpen : titleClosed}
        isActive={isOpen}
        size={size}
        iconSize={iconSize}
        className={`transition-all duration-200 ${isOpen ? 'bg-blue-300' : 'bg-blue-500'}`}
      />

      {/* Sous-menu avec effet accordéon horizontal */}
      <div
        className={`flex overflow-hidden transition-all duration-300`}
        style={{
          width: isOpen ? `${menuWidth}px` : '0px', // Ajuster la largeur en fonction de l'état
          opacity: isOpen ? 1 : 0 // Ajouter une transition d'opacité
        }}
      >
        <div ref={contentRef} className="flex">
          {children}
        </div>
      </div>
    </div>
  )
}

export default ParentMenu
