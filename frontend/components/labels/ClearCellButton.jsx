import React from 'react'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { useInstance } from '../../context/InstanceContext'
import IconButton from '../ui/IconButton'

const ClearCellButton = () => {
  const { clearCellDesign, selectedCells, selectedCell } = useInstance()

  const handleClearClick = () => {
    const cellsToClear = selectedCells.length > 0 ? selectedCells : [selectedCell]

    if (cellsToClear.length > 0) {
      cellsToClear.forEach((cell) => clearCellDesign(cell))
    } else {
      console.log('Aucune cellule sélectionnée pour effacer le design.')
    }
  }

  return (
    <IconButton
      onClick={handleClearClick}
      icon={faTrash}
      title="Effacer le design"
      className="bg-red-500 hover:bg-red-600"
    />
  )
}

export default ClearCellButton
