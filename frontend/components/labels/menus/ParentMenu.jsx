import React from 'react'
import IconButton from '../../ui/IconButton'

const ParentMenu = ({ icon, titleOpen, titleClosed, isOpen, toggle, size, iconSize, children }) => {
  return (
    <div className="relative">
      <IconButton
        onClick={toggle}
        icon={icon}
        title={isOpen ? titleOpen : titleClosed}
        isActive={isOpen}
        size={size}
        iconSize={iconSize}
      />
      {/* Sous-menu avec animation de translation */}
      <div
        className={`absolute left-full top-0 ml-2 transition-all duration-500 ease-in-out${
          isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export default ParentMenu
