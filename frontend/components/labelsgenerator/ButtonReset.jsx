import React, { useContext } from 'react'
import { GridContext } from '../../context/GridContext'
import IconButton from '../ui/IconButton'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

const ButtonReset = () => {
  const { state, dispatch } = useContext(GridContext)
  const { selectedCellId, cellContents } = state

  const isDefaultContent = (cellId) => {
    const content = cellContents[cellId]
    return content?.every((item) => item.isInitialContent) // Vérifie si tous les objets ont le flag
  }

  const handleReset = () => {
    if (selectedCellId) {
      dispatch({ type: 'RESET_CELL', payload: { cellId: selectedCellId } })
    }
  }

  return (
    <IconButton
      onClick={handleReset}
      icon={faTrash}
      title="Vider"
      className={`bg-yellow-500 ${
        !selectedCellId || isDefaultContent(selectedCellId) ? 'cursor-not-allowed opacity-50' : ''
      }`}
      size="w-10 h-10"
      iconSize="text-lg"
      disabled={!selectedCellId || isDefaultContent(selectedCellId)} // Désactiver si aucun contenu ou déjà par défaut
    />
  )
}

export default ButtonReset
