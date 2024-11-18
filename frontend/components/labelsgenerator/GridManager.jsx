import React, { useContext } from 'react'
import { GridContext } from '../../context/GridContext'
import GridCell from './GridCell'

const GridManager = () => {
  const { state, dispatch } = useContext(GridContext)
  const { grid, config, selectedCellId, cellContents, currentPage, totalPages } = state

  const { pageWidth, pageHeight } = config

  // Filtrer les cellules pour la page courante
  const currentPageCells = grid.filter((cell) => cell.pageIndex === currentPage)

  const handleSelectCell = (id) => {
    dispatch({ type: 'SELECT_CELL', payload: id })
  }

  return (
    <div>
      {/* Navigation entre pages */}
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

      {/* Conteneur principal représentant la page */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '0',
          paddingBottom: `${(pageHeight / pageWidth) * 100}%`, // Ratio A4
          background: '#fff',
          border: '2px solid #000', // Bordure autour de l'ensemble de la grille
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            overflow: 'hidden' // Évitez que les cellules débordent
          }}
        >
          {currentPageCells.map((cell) => (
            <GridCell
              key={cell.id}
              {...cell}
              isSelected={selectedCellId === cell.id}
              onClick={handleSelectCell}
              content={cellContents[cell.id] || ''}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default GridManager
