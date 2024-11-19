import React, { useContext } from 'react'
import { GridContext } from '../../context/GridContext'
import CellEditor from './CellEditor'
import { mmToPx } from '../../utils/conversionUtils'
import styles from '../labels/FabricDesigner.module.css'
import ButtonCopy from './ButtonCopy'
import ButtonPaste from './ButtonPaste'
import ButtonUnlink from './ButtonUnlink'
import ButtonReset from './ButtonReset'
import ButtonUndo from './ButtonUndo'
import ButtonRedo from './ButtonRedo'
import ButtonExportPDF from './ButtonExportPDF'

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
