import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PropTypes from 'prop-types'

const IconButton = ({ onClick, icon, title, className }) => {
  return (
    <button
      onClick={onClick}
      className={`rounded p-2 text-white transition-all duration-300 hover:opacity-90 ${className}`}
      title={title}
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  )
}

// Définir les types de propriétés attendues pour le bouton
IconButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.object.isRequired, // FontAwesomeIcon utilise des objets pour les icônes
  title: PropTypes.string,
  className: PropTypes.string
}

// Valeurs par défaut
IconButton.defaultProps = {
  title: '',
  className: 'bg-blue-500'
}

export default IconButton
