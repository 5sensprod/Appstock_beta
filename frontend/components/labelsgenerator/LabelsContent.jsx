import React, { useContext } from 'react'
import { GridContext } from '../../context/GridContext'
import GridConfigurator from './GridConfigurator'
import GridManager from './GridManager'
import CellEditor from './CellEditor'
import { mmToPx } from '../../utils/conversionUtils'

const LabelsContent = () => {
  const { state, dispatch, findLinkedGroup } = useContext(GridContext)
  const { selectedCellId, cellContents, config } = state
  const { cellWidth, cellHeight } = config

  // Déterminer le contenu initial de la cellule
  const initialContent = selectedCellId
    ? cellContents[selectedCellId] || cellContents.default
    : cellContents.default

  // Sauvegarde d'une cellule
  const handleSave = (content) => {
    if (selectedCellId) {
      dispatch({
        type: 'UPDATE_CELL_CONTENT',
        payload: { id: selectedCellId, content }
      })
    }
  }

  // Copier une cellule
  const handleCopy = () => {
    if (selectedCellId) {
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
        </div>

        {selectedCellId && (
          <CellEditor
            initialContent={initialContent}
            cellWidth={mmToPx(cellWidth)}
            cellHeight={mmToPx(cellHeight)}
            onSave={handleSave}
            cellId={selectedCellId}
            linkedGroup={findLinkedGroup(selectedCellId)} // Utilisation de la méthode centralisée
            dispatch={dispatch} // Transmettre le dispatch pour synchronisation
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
