import React, { useContext } from 'react'
import { GridContext } from '../../context/GridContext'
import IconButton from '../ui/IconButton'
import { faCopy } from '@fortawesome/free-solid-svg-icons'

const ButtonCopy = () => {
  const { state, dispatch } = useContext(GridContext)
  const { selectedCellId } = state

  const handleCopy = () => {
    if (selectedCellId) {
      dispatch({ type: 'COPY_CELL', payload: { cellId: selectedCellId } })
    }
  }

  return (
    <IconButton
      onClick={handleCopy}
      icon={faCopy}
      title="Copier"
      className={`bg-blue-500 ${!selectedCellId ? 'cursor-not-allowed opacity-50' : ''}`}
      size="w-10 h-10" // Taille ajustée pour le bouton
      iconSize="text-lg" // Taille ajustée pour l'icône
      disabled={!selectedCellId} // Désactiver le bouton si aucune cellule n'est sélectionnée
    />
  )
}

export default ButtonCopy
