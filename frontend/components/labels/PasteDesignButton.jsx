// frontend/components/labels/PasteDesignButton.jsx
import React from 'react'
import { useInstance } from '../../context/InstanceContext'

const PasteDesignButton = () => {
  const { pasteDesign, selectedCells, selectedCell } = useInstance() // Extraire selectedCells et selectedCell

  const handlePasteClick = () => {
    const cellsToPaste = selectedCells.length > 0 ? selectedCells : [selectedCell] // Utiliser la sélection multiple ou unique

    if (cellsToPaste.length > 0) {
      pasteDesign(cellsToPaste) // Coller le design dans toutes les cellules sélectionnées
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
