import React, { useContext } from 'react'
import { GridContext } from '../../context/GridContext'
import GridCell from './GridCell'

const GridManager = () => {
  const { state, dispatch, findLinkedGroup } = useContext(GridContext)
  const { grid, config, selectedCellId, cellContents, currentPage, totalPages } = state

  const { pageWidth, pageHeight } = config

  // Filtrer les cellules pour la page courante
  const currentPageCells = grid.filter((cell) => cell.pageIndex === currentPage)

  const handleSelectCell = (id) => {
    dispatch({ type: 'SELECT_CELL', payload: id })
  }

  const navigatePage = (direction) => {
    const newPage = currentPage + direction
    dispatch({ type: 'SET_PAGE', payload: { page: newPage } })
  }

  return (
    <div className="space-y-4">
      {/* Navigation entre pages */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => navigatePage(-1)}
          disabled={currentPage === 0}
          className="rounded bg-gray-200 px-4 py-2 text-gray-800 disabled:opacity-50"
        >
          Précédent
        </button>
        <span className="text-gray-700">
          Page {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={() => navigatePage(1)}
          disabled={currentPage === totalPages - 1}
          className="rounded bg-gray-200 px-4 py-2 text-gray-800 disabled:opacity-50"
        >
          Suivant
        </button>
      </div>

      {/* Conteneur principal représentant la page */}
      <div
        className="relative w-full border-2 border-black bg-white"
        style={{
          paddingBottom: `${(pageHeight / pageWidth) * 100}%` // Ratio de la page (ex: A4)
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {currentPageCells.map((cell) => {
            const linkedGroup = findLinkedGroup(cell.id)
            const isLinkedAndSelected =
              linkedGroup.includes(selectedCellId) && cell.id === selectedCellId

            return (
              <GridCell
                key={cell.id}
                {...cell}
                isSelected={selectedCellId === cell.id}
                isLinkedAndSelected={isLinkedAndSelected}
                linkedGroup={linkedGroup}
                linkedByCsv={cellContents[cell.id]?.some((item) => item.linkedByCsv) || false}
                onClick={handleSelectCell}
                content={cellContents[cell.id]}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default GridManager
