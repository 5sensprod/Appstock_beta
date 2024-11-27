export const calculateGridDimensions = (config) => {
  const {
    pageWidth,
    pageHeight,
    offsetLeft,
    offsetTop,
    cellWidth,
    cellHeight,
    spacingHorizontal,
    spacingVertical
  } = config

  const availableWidth = pageWidth - 2 * offsetLeft
  const availableHeight = pageHeight - 2 * offsetTop

  const columns = Math.floor((availableWidth + spacingHorizontal) / (cellWidth + spacingHorizontal))
  const rows = Math.floor((availableHeight + spacingVertical) / (cellHeight + spacingVertical))

  return { columns, rows, cellsPerPage: columns * rows }
}

export const validateConfig = (config) => {
  const { pageWidth, pageHeight } = config
  const updatedConfig = { ...config }

  updatedConfig.offsetTop = Math.min(Math.max(updatedConfig.offsetTop, 0), pageHeight - 1)
  updatedConfig.offsetLeft = Math.min(Math.max(updatedConfig.offsetLeft, 0), pageWidth - 1)

  updatedConfig.cellWidth = Math.max(updatedConfig.cellWidth, 1)
  updatedConfig.cellHeight = Math.max(updatedConfig.cellHeight, 1)

  return updatedConfig
}

export const generateGrid = (config, totalPages) => {
  const {
    cellWidth,
    cellHeight,
    offsetTop,
    offsetLeft,
    spacingHorizontal,
    spacingVertical,
    pageWidth,
    pageHeight
  } = config

  const { columns, cellsPerPage } = calculateGridDimensions(config)
  const grid = []

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    for (let i = 0; i < cellsPerPage; i++) {
      const row = Math.floor(i / columns)
      const col = i % columns
      const cellId = `${pageIndex}-${row}-${col}`

      grid.push({
        id: cellId,
        pageIndex,
        row,
        col,
        width: (cellWidth / pageWidth) * 100,
        height: (cellHeight / pageHeight) * 100,
        left: ((offsetLeft + col * (cellWidth + spacingHorizontal)) / pageWidth) * 100,
        top: ((offsetTop + row * (cellHeight + spacingVertical)) / pageHeight) * 100
      })
    }
  }

  return { grid, cellsPerPage }
}

export const withUndoRedo = (state, newState) => {
  return {
    ...newState,
    undoStack: [...state.undoStack, state],
    redoStack: []
  }
}
