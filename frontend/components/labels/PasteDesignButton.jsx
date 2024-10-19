// frontend/components/labels/PasteDesignButton.jsx
import React from 'react'
import { useInstance } from '../../context/InstanceContext'

const PasteDesignButton = () => {
  const { pasteDesign, selectedCell } = useInstance() // Extraire pasteDesign et selectedCell

  const handlePasteClick = () => {
    if (selectedCell !== null) {
      // Coller le design dans la cellule sélectionnée
      pasteDesign([selectedCell]) // On passe la cellule sélectionnée comme tableau
    } else {
      console.log('Aucune cellule sélectionnée pour coller le design.')
    }
  }

  return (
    <button
      className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
      onClick={handlePasteClick}
    >
      Coller le design
    </button>
  )
}

export default PasteDesignButton
