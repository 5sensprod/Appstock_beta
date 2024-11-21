import React, { useContext } from 'react'
import { CanvasProvider } from '../../context/CanvasContext'
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
import FabricDesigner from '../labels/FabricDesigner'

const LabelsContent = () => {
  const { state, dispatch, findLinkedGroup } = useContext(GridContext)
  const { selectedCellId, cellContents, config } = state
  const { cellWidth, cellHeight } = config
  const cellContent =
    selectedCellId && cellContents[selectedCellId] ? cellContents[selectedCellId] : []
  console.log('LabelsContent: selectedCellId:', selectedCellId)
  console.log('LabelsContent: gridDispatch:', dispatch)
  return (
    <CanvasProvider gridDispatch={dispatch} selectedCellId={selectedCellId}>
      <div className={styles.app}>
        {/* Barre d'outils */}
        <div className="flex items-center space-x-2">
          <ButtonCopy />
          <ButtonPaste />
          <ButtonUnlink />
          <ButtonReset />
          <ButtonUndo />
          <ButtonRedo />
          <ButtonExportPDF />
        </div>

        {/* Éditeur de cellule */}
        <CellEditor
          key={selectedCellId} // Utilisez selectedCellId comme clé unique
          initialContent={cellContent}
          cellWidth={mmToPx(cellWidth)}
          cellHeight={mmToPx(cellHeight)}
          cellId={selectedCellId}
          linkedGroup={selectedCellId ? findLinkedGroup(selectedCellId) : []}
          dispatch={dispatch}
        />

        {/* Gestionnaire de canevas */}
        <FabricDesigner />
      </div>
    </CanvasProvider>
  )
}

export default LabelsContent
