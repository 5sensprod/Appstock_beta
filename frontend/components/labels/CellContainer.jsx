import React, { useRef, useState, useEffect } from 'react'
import { useCellManagerContext } from '../../context/CellManagerContext'

const CellContainer = () => {
  const { state, renderCell } = useCellManagerContext()

  return (
    <div className="cell-container flex flex-wrap gap-4 p-4">
      {state.cells.map((cell, index) => (
        <Cell key={index} data={cell} renderCell={renderCell} />
      ))}
    </div>
  )
}

const Cell = React.memo(({ data, renderCell }) => {
  const canvasRef = useRef(null)
  const [, setTempProperties] = useState({})

  useEffect(() => {
    const currentCanvasRef = canvasRef.current
    renderCell(data, currentCanvasRef, setTempProperties)

    return () => {
      if (currentCanvasRef && currentCanvasRef._fabricCanvas) {
        currentCanvasRef._fabricCanvas.dispose()
      }
    }
  }, [data, renderCell])

  return (
    <div className="cell rounded border border-gray-300 p-4 shadow-md">
      <canvas ref={canvasRef} width={180} height={100} />
    </div>
  )
})

export default CellContainer
