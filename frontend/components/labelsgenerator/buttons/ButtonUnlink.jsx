import React, { useContext } from 'react'
import { GridContext } from '../../../context/GridContext'
import IconButton from '../../ui/IconButton'
import { faUnlink } from '@fortawesome/free-solid-svg-icons'

const ButtonUnlink = () => {
  const { state, dispatch, findLinkedGroup } = useContext(GridContext)
  const { selectedCellId } = state

  const handleUnlink = () => {
    if (selectedCellId) {
      dispatch({ type: 'UNLINK_CELL', payload: { cellId: selectedCellId } })
    }
  }

  const isUnlinkDisabled = !selectedCellId || findLinkedGroup(selectedCellId).length <= 1

  return (
    <IconButton
      onClick={handleUnlink}
      icon={faUnlink}
      title="Délier"
      className={`bg-red-500 ${isUnlinkDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
      size="w-10 h-10"
      iconSize="text-lg"
      disabled={isUnlinkDisabled} // Désactiver si aucune cellule sélectionnée ou groupe insuffisant
    />
  )
}

export default ButtonUnlink
