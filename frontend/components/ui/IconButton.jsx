import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PropTypes from 'prop-types'

const IconButton = ({
  onClick,
  icon,
  title = '', // Valeur par défaut pour title
  className = 'bg-blue-500', // Valeur par défaut pour className
  size = 'w-12 h-12', // Nouvelle prop pour gérer la taille du bouton
  iconSize = 'text-xl' // Nouvelle prop pour gérer la taille de l'icône
}) => {
  return (
    <button
      onClick={onClick}
      className={`rounded text-white transition-all duration-300 hover:opacity-90 ${size} ${className}`}
      title={title}
    >
      <FontAwesomeIcon icon={icon} className={iconSize} />
    </button>
  )
}

// Définir les types de propriétés attendues pour le bouton
IconButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.object.isRequired, // FontAwesomeIcon utilise des objets pour les icônes
  title: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.string, // Définir la taille du bouton comme un string (ex: w-12 h-12)
  iconSize: PropTypes.string // Définir la taille de l'icône comme un string (ex: text-xl)
}

export default IconButton
