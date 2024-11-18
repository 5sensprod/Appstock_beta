import React, { useContext } from 'react'
import { GridContext } from '../../context/GridContext'
import GridConfigurator from './GridConfigurator'
import GridManager from './GridManager'
import CellEditor from './CellEditor'
import { mmToPx } from '../../utils/conversionUtils'

const LabelsContent = () => {
  const { state, dispatch } = useContext(GridContext)
  const { selectedCellId, cellContents, config } = state
  const { cellWidth, cellHeight } = config

  const handleSave = (content) => {
    if (selectedCellId) {
      dispatch({
        type: 'UPDATE_CELL_CONTENT',
        payload: { id: selectedCellId, content }
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
        {selectedCellId && (
          <CellEditor
            cellId={selectedCellId}
            initialContent={cellContents[selectedCellId]?.text || ''}
            cellWidth={mmToPx(cellWidth)} // Conversion en pixels
            cellHeight={mmToPx(cellHeight)} // Conversion en pixels
            onSave={handleSave}
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
        {/* Configuration */}
        <div style={{ flex: 1, marginBottom: '20px' }}>
          <GridConfigurator />
        </div>

        {/* Grid */}
        <div style={{ flex: 2 }}>
          <GridManager />
        </div>
      </div>
    </div>
  )
}

export default LabelsContent
