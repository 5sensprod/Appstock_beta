import React, { useContext } from 'react'
import { GridContext } from '../../context/GridContext'
import GridConfigurator from './GridConfigurator'
import GridManager from './GridManager'
import CellEditor from './CellEditor'
import { mmToPx } from '../../utils/conversionUtils'
import { exportGridToPDF } from './GridExporter'

const LabelsContent = () => {
  const { state, dispatch, findLinkedGroup } = useContext(GridContext)
  const { selectedCellId, cellContents, config } = state
  const { cellWidth, cellHeight } = config

  const handleExportPDF = async () => {
    const { grid, cellContents, config } = state
    await exportGridToPDF(grid, cellContents, config)
  }

  // Déterminer le contenu initial de la cellule
  const initialContent = selectedCellId
    ? cellContents[selectedCellId] || cellContents.default
    : cellContents.default

  // Vérifier si une cellule contient son contenu initial
  const isDefaultContent = (cellId) => {
    const content = cellContents[cellId]
    return content?.every((item) => item.isInitialContent) // Vérifie si tous les objets ont le flag
  }

  // Copier une cellule avec sauvegarde automatique
  const handleCopy = () => {
    if (selectedCellId) {
      // Action COPY_CELL pour mettre la cellule dans le presse-papiers
      dispatch({ type: 'COPY_CELL', payload: { cellId: selectedCellId } })
    }
  }

  // Coller une cellule et lier les cellules source/destination
  const handlePaste = () => {
    if (selectedCellId && state.clipboard) {
      dispatch({ type: 'PASTE_CELL', payload: { cellId: selectedCellId } })
      dispatch({
        type: 'LINK_CELLS',
        payload: { source: state.clipboard.cellId, destination: selectedCellId }
      })
    }
  }

  // Vider une cellule
  const handleReset = () => {
    if (selectedCellId) {
      dispatch({ type: 'RESET_CELL', payload: { cellId: selectedCellId } })
    }
  }

  // Délier une cellule
  const handleUnlink = () => {
    if (selectedCellId) {
      dispatch({ type: 'UNLINK_CELL', payload: { cellId: selectedCellId } })
    }
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Canvas Section */}
      <div
        style={{
          flex: 3,
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRight: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Aperçu de l'Étiquette</h2>
        <div style={{ marginBottom: '20px' }}>
          <button onClick={handleCopy} disabled={!selectedCellId}>
            Copier
          </button>
          <button onClick={handlePaste} disabled={!selectedCellId || !state.clipboard}>
            Coller
          </button>
          <button
            onClick={handleUnlink}
            disabled={!selectedCellId || findLinkedGroup(selectedCellId).length <= 1}
          >
            Délier
          </button>
          <button
            onClick={handleReset}
            disabled={!selectedCellId || isDefaultContent(selectedCellId)} // Désactivé si contenu initial
          >
            Vider
          </button>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => dispatch({ type: 'UNDO' })}
            disabled={state.undoStack.length === 0}
          >
            Annuler
          </button>
          <button
            onClick={() => dispatch({ type: 'REDO' })}
            disabled={state.redoStack.length === 0}
          >
            Refaire
          </button>
          <div>
            <button onClick={handleExportPDF}>Exporter en PDF</button>
          </div>
        </div>

        {selectedCellId && (
          <CellEditor
            initialContent={initialContent}
            cellWidth={mmToPx(cellWidth)}
            cellHeight={mmToPx(cellHeight)}
            cellId={selectedCellId}
            linkedGroup={findLinkedGroup(selectedCellId)} // Utilisation de la méthode centralisée
            dispatch={dispatch} // Transmettre le dispatch pour synchronisation automatique
          />
        )}
      </div>

      {/* Configuration & Grid Section */}
      <div
        style={{
          flex: 5,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          overflowY: 'auto'
        }}
      >
        <div style={{ flex: 1, marginBottom: '20px' }}>
          <GridConfigurator />
        </div>
        <div style={{ flex: 2 }}>
          <GridManager />
        </div>
      </div>
    </div>
  )
}

export default LabelsContent
