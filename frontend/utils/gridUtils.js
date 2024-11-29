// Utilitaires
const calculateDimensions = ({
  pageWidth,
  pageHeight,
  offsetLeft,
  offsetTop,
  cellWidth,
  cellHeight,
  spacingHorizontal,
  spacingVertical
}) => {
  const availableWidth = pageWidth - 2 * offsetLeft
  const availableHeight = pageHeight - 2 * offsetTop

  const columns = Math.floor((availableWidth + spacingHorizontal) / (cellWidth + spacingHorizontal))
  const rows = Math.floor((availableHeight + spacingVertical) / (cellHeight + spacingVertical))

  return { columns, rows, cellsPerPage: columns * rows }
}

const createCell = (config, pageIndex, globalIndex, row, col) => {
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

  return {
    id: `${pageIndex}-${globalIndex}`,
    pageIndex,
    row,
    col,
    globalIndex,
    width: (cellWidth / pageWidth) * 100,
    height: (cellHeight / pageHeight) * 100,
    left: ((offsetLeft + col * (cellWidth + spacingHorizontal)) / pageWidth) * 100,
    top: ((offsetTop + row * (cellHeight + spacingVertical)) / pageHeight) * 100
  }
}

// Fonctions principales
export const generateGrid = (config, totalPages) => {
  const { columns, rows, cellsPerPage } = calculateDimensions(config)
  const grid = []

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const baseIndex = pageIndex * cellsPerPage
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        grid.push(createCell(config, pageIndex, baseIndex + row * columns + col, row, col))
      }
    }
  }

  return { grid, cellsPerPage }
}

export const validateConfig = ({ pageWidth, pageHeight, ...config }) => ({
  ...config,
  offsetTop: Math.min(Math.max(config.offsetTop, 0), pageHeight - 1),
  offsetLeft: Math.min(Math.max(config.offsetLeft, 0), pageWidth - 1),
  cellWidth: Math.max(config.cellWidth, 1),
  cellHeight: Math.max(config.cellHeight, 1),
  pageWidth,
  pageHeight
})

export const recalculatePages = (state) => {
  const { cellsPerPage } = calculateDimensions(state.config)
  const filledCellsCount = Object.values(state.cellContents).filter(
    (content) => content?.length > 0
  ).length
  const requiredPages = Math.max(state.totalPages, Math.ceil(filledCellsCount / cellsPerPage))

  if (requiredPages === state.totalPages) return state

  const { grid } = generateGrid(state.config, requiredPages)
  return {
    ...state,
    grid,
    totalPages: requiredPages,
    currentPage: Math.min(state.currentPage, requiredPages - 1)
  }
}

export const importCsvData = (state, rows) => {
  const { cellsPerPage } = calculateDimensions(state.config)
  const existingFilledCount = Object.values(state.cellContents).filter(
    (content) => content?.length > 0
  ).length
  const totalCells = existingFilledCount + rows.length
  const totalPages = Math.max(state.totalPages, Math.ceil(totalCells / cellsPerPage))

  const { grid } = generateGrid(state.config, totalPages)
  const newLinkedGroup = []
  const newCellContents = { ...state.cellContents }

  rows.forEach((row, index) => {
    const globalIndex = existingFilledCount + index
    const cellId = `${Math.floor(globalIndex / cellsPerPage)}-${globalIndex}`

    newCellContents[cellId] = Object.entries(row).map(([key, value], idx) => ({
      id: `${key}-${idx}`,
      linkedByCsv: true,
      left: 10 + idx * 50,
      top: 10,
      ...(key.includes('shape')
        ? { type: 'rect', width: 50, height: 30, fill: '#FFD700' }
        : { type: 'i-text', text: value, fontSize: 14, fill: '#333' })
    }))
    newLinkedGroup.push(cellId)
  })

  return {
    ...state,
    cellContents: Object.fromEntries(
      Object.entries(newCellContents).filter(([key]) => grid.some((cell) => cell.id === key))
    ),
    grid,
    totalPages,
    linkedGroups: [...state.linkedGroups, newLinkedGroup],
    cellsPerPage
  }
}

export const redistributeCellContents = (state) => {
  const { cellsPerPage } = calculateDimensions(state.config)
  const filledCells = Object.entries(state.cellContents)
    .filter(([_, content]) => content?.length > 0)
    .sort(([a], [b]) => parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]))

  const newCellContents = {}
  const newLinkedGroups = []
  const processedGroups = new Set()

  filledCells.forEach(([oldId, content], index) => {
    const newId = `${Math.floor(index / cellsPerPage)}-${index}`
    newCellContents[newId] = content

    const linkedGroup = state.linkedGroups.find((group) => group.includes(oldId))
    if (linkedGroup && !processedGroups.has(linkedGroup)) {
      processedGroups.add(linkedGroup)
      newLinkedGroups.push(
        linkedGroup.map((id) =>
          filledCells.findIndex(([oldId]) => oldId === id) !== -1
            ? `${Math.floor(filledCells.findIndex(([oldId]) => oldId === id) / cellsPerPage)}-${filledCells.findIndex(([oldId]) => oldId === id)}`
            : id
        )
      )
    }
  })

  const totalPages = Math.max(1, Math.ceil(filledCells.length / cellsPerPage))
  const { grid } = generateGrid(state.config, totalPages)

  return {
    ...state,
    cellContents: newCellContents,
    grid,
    totalPages,
    currentPage: Math.min(state.currentPage, totalPages - 1),
    linkedGroups: [
      ...state.linkedGroups.filter(
        (group) => !group.some((id) => filledCells.some(([oldId]) => oldId === id))
      ),
      ...newLinkedGroups
    ]
  }
}

export const withUndoRedo = (state, newState) => ({
  ...newState,
  undoStack: [...state.undoStack, state],
  redoStack: []
})
