import React, { useContext } from 'react'
import { GridContext } from '../../../context/GridContext'
import IconButton from '../../ui/IconButton'
import { faRedo } from '@fortawesome/free-solid-svg-icons'

const ButtonRedo = () => {
  const { state, dispatch } = useContext(GridContext)

  const handleRedo = () => {
    dispatch({ type: 'REDO' })
  }

  return (
    <IconButton
      onClick={handleRedo}
      icon={faRedo}
      title="Refaire"
      className={`bg-teal-500 ${
        state.redoStack.length === 0 ? 'cursor-not-allowed opacity-50' : ''
      }`}
      size="w-10 h-10"
      iconSize="text-lg"
      disabled={state.redoStack.length === 0} // Désactiver si aucune action à refaire
    />
  )
}

export default ButtonRedo
