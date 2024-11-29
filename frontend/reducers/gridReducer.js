//frontend\reducers\gridReducer.js
import {
  validateConfig,
  recalculatePages,
  importCsvData,
  withUndoRedo,
  redistributeCellContents
} from '../utils/gridUtils'

export const initialGridState = {
  config: {
    cellWidth: 48.5,
    cellHeight: 25,
    offsetTop: 22,
    offsetLeft: 8,
    spacingHorizontal: 0,
    spacingVertical: 0,
    pageWidth: 210,
    pageHeight: 297,
    backgroundColor: 'white'
  },
  grid: [],
  selectedCellId: null,
  cellContents: {},
  clipboard: null,
  linkedGroups: [],
  currentPage: 0,
  totalPages: 1,
  undoStack: [],
  redoStack: []
}

export function gridReducer(state, action) {
  switch (action.type) {
    case 'INITIALIZE_GRID':
      return {
        ...state,
        grid: action.payload.grid,
        cellsPerPage: action.payload.cellsPerPage,
        selectedCellId: action.payload.grid.length > 0 ? action.payload.grid[0].id : null
      }
    // avant
    case 'UPDATE_CONFIG': {
      const updatedConfig = validateConfig({
        ...state.config,
        ...action.payload.config
      })

      const needsRecalculation =
        action.payload.regenerateGrid ||
        [
          'cellWidth',
          'cellHeight',
          'spacingHorizontal',
          'spacingVertical',
          'pageWidth',
          'pageHeight'
        ].some((prop) => action.payload.config?.[prop] !== undefined)

      return needsRecalculation
        ? redistributeCellContents(recalculatePages({ ...state, config: updatedConfig }))
        : { ...state, config: updatedConfig }
    }

    case 'SET_PAGE': {
      const { page } = action.payload
      return {
        ...state,
        currentPage: Math.min(Math.max(0, page), state.totalPages - 1)
      }
    }

    case 'SELECT_CELL':
      return {
        ...state,
        selectedCellId: action.payload
      }

    case 'UPDATE_CELL_CONTENT': {
      const { id, content } = action.payload
      const existingContent = state.cellContents[id] || []
      const updatedContent = content.map((item) => ({
        ...item,
        linkedByCsv: existingContent.find((old) => old.id === item.id)?.linkedByCsv || false
      }))

      const hasContent = updatedContent.some((obj) => obj.type !== 'text' || obj.text?.trim())
      const newCellContents = {
        ...state.cellContents,
        [id]: hasContent ? updatedContent : undefined
      }

      return withUndoRedo(state, {
        ...state,
        cellContents: Object.fromEntries(Object.entries(newCellContents).filter(([_, v]) => v))
      })
    }
    case 'IMPORT_CSV': {
      const importedData = importCsvData(state, action.payload)

      // Utilisez recalculatePages pour garantir une pagination dynamique
      const finalState = recalculatePages({
        ...state,
        ...importedData
      })

      return withUndoRedo(state, finalState)
    }

    case 'SYNC_CELL_LAYOUT': {
      const { sourceId, layout } = action.payload
      const linkedGroup = state.linkedGroups.find((group) => group.includes(sourceId))
      if (!linkedGroup) return state

      const updatedCellContents = { ...state.cellContents }
      linkedGroup.forEach((cellId) => {
        if (updatedCellContents[cellId]) {
          updatedCellContents[cellId] = updatedCellContents[cellId].map((item) => {
            const layoutItem = layout[item.id]
            if (!layoutItem) return item

            return {
              ...item,
              ...layoutItem,
              linkedByCsv: item.linkedByCsv // Préserve le flag CSV
            }
          })
        }
      })

      return { ...state, cellContents: updatedCellContents }
    }

    case 'LINK_CELLS': {
      const { source, destination } = action.payload
      const existingGroupIndex = state.linkedGroups.findIndex((group) => group.includes(source))
      const updatedGroups =
        existingGroupIndex > -1
          ? state.linkedGroups.map((group, i) =>
              i === existingGroupIndex ? [...group, destination] : group
            )
          : [...state.linkedGroups, [source, destination]]

      return withUndoRedo(state, { ...state, linkedGroups: updatedGroups })
    }

    case 'UNLINK_CELL': {
      const { cellId } = action.payload
      const updatedGroups = state.linkedGroups
        .map((group) => group.filter((id) => id !== cellId))
        .filter((group) => group.length > 1)

      const updatedContents = { ...state.cellContents }
      if (updatedContents[cellId]) {
        updatedContents[cellId] = updatedContents[cellId].map((item) => ({
          ...item,
          linkedByCsv: false
        }))
      }

      return withUndoRedo(state, {
        ...state,
        linkedGroups: updatedGroups,
        cellContents: updatedContents
      })
    }

    case 'COPY_CELL': {
      const { cellId } = action.payload
      const cellContent = state.cellContents[cellId]
      if (!cellContent?.length) return state

      const existingGroupIndex = state.linkedGroups.findIndex((group) => group.includes(cellId))
      const updatedGroups =
        existingGroupIndex === -1 ? [...state.linkedGroups, [cellId]] : state.linkedGroups

      return {
        ...state,
        clipboard: { cellId },
        linkedGroups: updatedGroups
      }
    }

    case 'PASTE_CELL': {
      const { cellId } = action.payload
      const clipboardContent = state.cellContents[state.clipboard?.cellId]
      if (!clipboardContent) return state

      return withUndoRedo(state, {
        ...state,
        cellContents: {
          ...state.cellContents,
          [cellId]: clipboardContent.map((item) => ({ ...item }))
        }
      })
    }

    case 'RESET_CELL': {
      const { cellId } = action.payload
      const updatedGroups = state.linkedGroups
        .map((group) => group.filter((id) => id !== cellId))
        .filter((group) => group.length > 1)

      return withUndoRedo(state, {
        ...state,
        cellContents: {
          ...state.cellContents,
          [cellId]: []
        },
        linkedGroups: updatedGroups
      })
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state // Rien à annuler
      const previousState = state.undoStack[state.undoStack.length - 1]
      const newUndoStack = state.undoStack.slice(0, -1)
      const newRedoStack = [state, ...state.redoStack] // Ajouter l'état actuel à redoStack
      return {
        ...previousState,
        undoStack: newUndoStack,
        redoStack: newRedoStack
      }
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state // Rien à refaire
      const nextState = state.redoStack[0]
      const newRedoStack = state.redoStack.slice(1)
      const newUndoStack = [...state.undoStack, state] // Ajouter l'état actuel à undoStack
      return {
        ...nextState,
        undoStack: newUndoStack,
        redoStack: newRedoStack
      }
    }
    default:
      return state
  }
}
