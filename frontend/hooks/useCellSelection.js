import { useCallback, useEffect } from 'react'
import { useInstance } from '../context/InstanceContext'
import { useCanvas } from '../context/CanvasContext'

const useCellSelection = () => {
  const { labelConfig } = useCanvas()
  const { selectedCells, handleCellClick, dispatchInstanceAction, instanceState } = useInstance() // Récupère dispatchInstanceAction et instanceState

  const updateGrid = useCallback(() => {
    const { labelWidth, labelHeight, offsetTop, offsetLeft, spacingVertical, spacingHorizontal } =
      labelConfig

    const pageWidth = 210
    const pageHeight = 297

    const availableWidth = pageWidth - offsetLeft
    const availableHeight = pageHeight - offsetTop

    const labelsPerRow = Math.floor(
      (availableWidth + spacingHorizontal) / (labelWidth + spacingHorizontal)
    )
    const labelsPerColumn = Math.floor(
      (availableHeight + spacingVertical) / (labelHeight + spacingVertical)
    )

    const totalCells = labelsPerRow * labelsPerColumn
    dispatchInstanceAction({ type: 'SET_TOTAL_CELLS', payload: totalCells })

    const gridContainer = document.getElementById('gridContainer')
    if (gridContainer) {
      gridContainer.innerHTML = ''

      for (let row = 0; row < labelsPerColumn; row++) {
        for (let col = 0; col < labelsPerRow; col++) {
          const labelIndex = row * labelsPerRow + col
          const label = document.createElement('div')

          const hasDesign = Boolean(instanceState?.objects?.[labelIndex])
          const isLinkedCell = Object.keys(instanceState.linkedCells).some(
            (primaryCell) =>
              parseInt(primaryCell) === labelIndex ||
              instanceState.linkedCells[primaryCell].includes(labelIndex)
          )
          // console.log('Label Index:', labelIndex, 'Is Linked:', isLinkedCell)

          label.className = `absolute border ${
            selectedCells.includes(labelIndex) && isLinkedCell
              ? 'border-red-500 bg-red-500'
              : selectedCells.includes(labelIndex)
                ? 'border-blue-500 bg-blue-500'
                : isLinkedCell
                  ? 'border-red-100 bg-red-200'
                  : hasDesign
                    ? 'border-blue-300 bg-blue-200'
                    : 'border-gray-300 bg-gray-100'
          } cursor-pointer`

          label.style.width = `${(labelWidth / pageWidth) * 100}%`
          label.style.height = `${(labelHeight / pageHeight) * 100}%`
          label.style.left = `${((offsetLeft + col * (labelWidth + spacingHorizontal)) / pageWidth) * 100}%`
          label.style.top = `${((offsetTop + row * (labelHeight + spacingVertical)) / pageHeight) * 100}%`

          label.onclick = (event) => handleCellClick(labelIndex, event)

          gridContainer.appendChild(label)
        }
      }
    }
  }, [
    labelConfig,
    selectedCells,
    handleCellClick,
    dispatchInstanceAction,
    instanceState?.objects,
    instanceState.linkedCells
  ])

  useEffect(() => {
    updateGrid()
  }, [updateGrid, instanceState?.objects, selectedCells, instanceState?.linkedCells]) //

  return { updateGrid, selectedCells }
}

export default useCellSelection
