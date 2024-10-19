import React, { useEffect } from 'react'
import { useInstance } from '../../context/InstanceContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaste } from '@fortawesome/free-solid-svg-icons'

const PasteDesignButton = () => {
  const { pasteDesign, selectedCells } = useInstance()

  useEffect(() => {
    console.log('Selected Cells at button render:', selectedCells) // Vérifiez que selectedCells est bien partagé
  }, [selectedCells])

  const handlePaste = () => {
    console.log('Bouton "Coller" cliqué')
    console.log('Cellules sélectionnées pour coller:', selectedCells) // Vérification

    if (selectedCells.length > 0) {
      pasteDesign(selectedCells, false) // Coller dans les cellules sélectionnées
    } else {
      console.log('Aucune cellule sélectionnée pour coller le design.')
    }
  }

  return (
    <button
      onClick={handlePaste}
      className="rounded bg-green-500 p-2 text-white shadow hover:bg-green-600"
      title="Coller le design"
    >
      <FontAwesomeIcon icon={faPaste} />
    </button>
  )
}

export default PasteDesignButton
