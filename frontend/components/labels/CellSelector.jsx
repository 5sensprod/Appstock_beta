// components/labels/CellSelector.jsx

import React from 'react'
import { useCellManagerContext } from '../../context/CellManagerContext'

const CellSelector = () => {
  const { state, selectCell } = useCellManagerContext()

  return (
    <div className="cell-selector">
      <ul>
        {state.cells.map((cell, index) => (
          <li key={index} onClick={() => selectCell(index)} className="cursor-pointer">
            {cell.name} - {cell.price}€ - {cell.gencode}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CellSelector
