import React, { useContext } from 'react'
import { GridContext } from '../../context/GridContext'
import GridCell from './GridCell'

const GridManager = () => {
  const { state, dispatch } = useContext(GridContext)
  const { grid, config, selectedCellId, cellContents, currentPage, totalPages } = state

  const { pageWidth, pageHeight, offsetTop, offsetLeft } = config

  // Filtrer les cellules pour la page courante
  const currentPageCells = grid.filter((cell) => cell.pageIndex === currentPage)

  const handleSelectCell = (id) => {
    dispatch({ type: 'SELECT_CELL', payload: id })
  }

  return (
    <div>
      <div style={{ marginBottom: '10px', textAlign: 'center' }}>
        <button
          onClick={() => dispatch({ type: 'SET_PAGE', payload: { page: currentPage - 1 } })}
          disabled={currentPage === 0}
        >
          Précédent
        </button>
        <span style={{ margin: '0 10px' }}>
          Page {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={() =>
            dispatch({
              type: 'SET_PAGE',
              payload: { page: currentPage + 1 }
            })
          }
          disabled={currentPage === totalPages - 1}
        >
          Suivant
        </button>
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '0',
          paddingBottom: `${(pageHeight / pageWidth) * 100}%`,
          background: '#fff',
          border: '2px solid #000'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: `${(offsetTop / pageHeight) * 100}%`,
            left: `${(offsetLeft / pageWidth) * 100}%`,
            right: `${(offsetLeft / pageWidth) * 100}%`,
            bottom: `${(offsetTop / pageHeight) * 100}%`
          }}
        >
          {currentPageCells.map((cell) => (
            <GridCell
              key={cell.id}
              {...cell}
              isSelected={selectedCellId === cell.id}
              onClick={handleSelectCell}
              content={cellContents[cell.id] || 'Vide'}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default GridManager
