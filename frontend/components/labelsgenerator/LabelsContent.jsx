import React, { useContext } from 'react'
import { GridContext } from '../../context/GridContext'
import CellEditor from './CellEditor'
import { mmToPx } from '../../utils/conversionUtils'
import styles from '../labels/FabricDesigner.module.css'
import ButtonCopy from './buttons/ButtonCopy'
import ButtonPaste from './buttons/ButtonPaste'
import ButtonUnlink from './buttons/ButtonUnlink'
import ButtonReset from './buttons/ButtonReset'
import ButtonUndo from './buttons/ButtonUndo'
import ButtonRedo from './buttons/ButtonRedo'
import ButtonExportPDF from './buttons/ButtonExportPDF'

const LabelsContent = () => {
  const { state, dispatch, findLinkedGroup } = useContext(GridContext)
  const { selectedCellId, cellContents, config } = state
  const { cellWidth, cellHeight } = config

  return (
    <div className={styles.app}>
      {/* Canvas Section */}
      <div className="flex items-center space-x-2">
        <ButtonCopy />
        <ButtonPaste />
        <ButtonUnlink />
        <ButtonReset />
        <ButtonUndo />
        <ButtonRedo />
        <ButtonExportPDF />
      </div>

      <CellEditor
        initialContent={
          selectedCellId && cellContents[selectedCellId]
            ? cellContents[selectedCellId] // Contenu existant pour la cellule
            : [] // Cellule vide par défaut
        }
        cellWidth={mmToPx(cellWidth)}
        cellHeight={mmToPx(cellHeight)}
        cellId={selectedCellId}
        linkedGroup={selectedCellId ? findLinkedGroup(selectedCellId) : []} // Tableau vide si aucune cellule sélectionnée
        dispatch={dispatch} // Synchronisation avec le reducer
      />
    </div>
  )
}

export default LabelsContent
