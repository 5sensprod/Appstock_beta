// frontend/components/labels/LayoutGrid.jsx
import React from 'react'
import useGridGenerator from '../../hooks/cells/useGridGenerator'
import { useCanvas } from '../../context/CanvasContext'

const LayoutGrid = () => {
  const { selectCell } = useCanvas()

  useGridGenerator(selectCell)

  return (
    <div className="relative w-full border-2 border-gray-300 bg-light-background pb-[141.4%] shadow-xl dark:bg-dark-background">
      <div id="gridContainer" className="absolute left-0 top-0 size-full"></div>
    </div>
  )
}

export default LayoutGrid
