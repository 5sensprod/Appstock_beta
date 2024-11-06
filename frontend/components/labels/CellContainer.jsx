// components/labels/CellContainer.jsx

import React from 'react'
import { useCellManagerContext } from '../../context/CellManagerContext'
import Cell from './Cell'

const CellContainer = () => {
  const { state } = useCellManagerContext()

  return (
    <div className="cell-container flex flex-wrap gap-4 p-4">
      {state.cells.map((cell, index) => (
        <Cell key={index} data={cell} />
      ))}
    </div>
  )
}

export default CellContainer
