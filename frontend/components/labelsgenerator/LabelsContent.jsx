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
import FabricDesigner from '../labels/FabricDesigner'
// import ZoomControl from '../labels/ZoomControl'
// import CanvasControl from '../labels/CanvasControl'
const LabelsContent = () => {
  const { state, dispatch, findLinkedGroup } = useContext(GridContext)
  const { selectedCellId, cellContents, config } = state
  const { cellWidth, cellHeight } = config
  const cellContent =
    selectedCellId && cellContents[selectedCellId] ? cellContents[selectedCellId] : []
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
        key={selectedCellId} // Utilisez selectedCellId pour la clé
        initialContent={cellContent}
        cellWidth={mmToPx(cellWidth)}
        cellHeight={mmToPx(cellHeight)}
        cellId={selectedCellId}
        linkedGroup={selectedCellId ? findLinkedGroup(selectedCellId) : []}
        dispatch={dispatch}
      />
      <FabricDesigner />
      {/* <ZoomControl />
      <CanvasControl /> */}
    </div>
  )
}

export default LabelsContent
