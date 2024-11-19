import React, { useContext } from 'react'
import { GridContext } from '../../context/GridContext'
import IconButton from '../ui/IconButton'
import { faUndo } from '@fortawesome/free-solid-svg-icons'

const ButtonUndo = () => {
  const { state, dispatch } = useContext(GridContext)

  const handleUndo = () => {
    dispatch({ type: 'UNDO' })
  }

  return (
    <IconButton
      onClick={handleUndo}
      icon={faUndo}
      title="Annuler"
      className={`bg-purple-500 ${
        state.undoStack.length === 0 ? 'cursor-not-allowed opacity-50' : ''
      }`}
      size="w-10 h-10"
      iconSize="text-lg"
      disabled={state.undoStack.length === 0} // Désactiver si aucune action à annuler
    />
  )
}

export default ButtonUndo
