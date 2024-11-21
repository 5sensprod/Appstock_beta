import React from 'react'
import ButtonCopy from './buttons/ButtonCopy'
import ButtonPaste from './buttons/ButtonPaste'
import ButtonUnlink from './buttons/ButtonUnlink'
import ButtonReset from './buttons/ButtonReset'
import ButtonUndo from './buttons/ButtonUndo'
import ButtonRedo from './buttons/ButtonRedo'
import ButtonExportPDF from './buttons/ButtonExportPDF'

const MenuCell = () => {
  return (
    <div className="flex items-center space-x-2">
      <ButtonCopy />
      <ButtonPaste />
      <ButtonUnlink />
      <ButtonReset />
      <ButtonUndo />
      <ButtonRedo />
      <ButtonExportPDF />
    </div>
  )
}

export default MenuCell
