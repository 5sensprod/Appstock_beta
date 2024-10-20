import React from 'react'
import { faPaste } from '@fortawesome/free-solid-svg-icons'
import { useInstance } from '../../context/InstanceContext'
import IconButton from '../ui/IconButton'

const PasteDesignButton = () => {
  const { pasteDesign, selectedCells, selectedCell } = useInstance()

  const handlePasteClick = () => {
    const cellsToPaste = selectedCells.length > 0 ? selectedCells : [selectedCell]

    if (cellsToPaste.length > 0) {
      pasteDesign(cellsToPaste)
    } else {
      console.log('Aucune cellule sélectionnée pour coller le design.')
    }
  }

  return (
    <IconButton
      onClick={handlePasteClick}
      icon={faPaste}
      title="Coller le design"
      className="bg-green-500 hover:bg-green-600"
    />
  )
}

export default PasteDesignButton
