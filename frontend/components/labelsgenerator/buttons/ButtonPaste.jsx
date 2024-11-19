import React, { useContext } from 'react'
import { GridContext } from '../../../context/GridContext'
import IconButton from '../../ui/IconButton'
import { faPaste } from '@fortawesome/free-solid-svg-icons'

const ButtonPaste = () => {
  const { state, dispatch } = useContext(GridContext)
  const { selectedCellId, clipboard } = state

  const handlePaste = () => {
    if (selectedCellId && clipboard) {
      dispatch({ type: 'PASTE_CELL', payload: { cellId: selectedCellId } })
      dispatch({
        type: 'LINK_CELLS',
        payload: { source: clipboard.cellId, destination: selectedCellId }
      })
    }
  }

  return (
    <IconButton
      onClick={handlePaste}
      icon={faPaste}
      title="Coller"
      className={`bg-green-500 ${
        !selectedCellId || !clipboard ? 'cursor-not-allowed opacity-50' : ''
      }`}
      size="w-10 h-10"
      iconSize="text-lg"
      disabled={!selectedCellId || !clipboard} // Désactiver si aucune cellule ou presse-papiers n'est disponible
    />
  )
}

export default ButtonPaste
