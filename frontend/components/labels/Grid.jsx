import React, { useState } from 'react'
import { useCanvas } from '../../context/CanvasContext'

const Grid = ({ rows = 3, cols = 3 }) => {
  const { saveCellState, loadCellState } = useCanvas()
  const [selectedCell, setSelectedCell] = useState(null)

  const handleCellClick = (cellId) => {
    if (selectedCell !== null) {
      saveCellState(selectedCell) // Sauvegarder l'état de la cellule sélectionnée précédemment
    }

    loadCellState(cellId) // Charger la cellule sélectionnée
    setSelectedCell(cellId)
  }
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '10px'
      }}
    >
      {Array.from({ length: rows * cols }).map((_, index) => {
        const cellId = `cell-${index}`
        return (
          <div
            key={cellId}
            onClick={() => handleCellClick(cellId)}
            style={{
              border: selectedCell === cellId ? '2px solid blue' : '1px solid gray',
              height: '100px',
              width: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: selectedCell === cellId ? '#f0f8ff' : '#fff'
            }}
          >
            Cell {index + 1}
          </div>
        )
      })}
    </div>
  )
}

export default Grid
