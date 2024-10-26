export const initialCellState = {
  selectedCell: 0,
  selectedCells: [0],
  cellDesigns: {},
  totalCells: 0,
  copiedDesign: null,
  unsavedChanges: false
}

export const cellReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SELECTED_CELL':
      return { ...state, selectedCell: action.payload }
    case 'SET_SELECTED_CELLS':
      return { ...state, selectedCells: action.payload }
    case 'UPDATE_CELL_DESIGN':
      return {
        ...state,
        cellDesigns: {
          ...state.cellDesigns,
          [action.payload.cellIndex]: action.payload.design
        }
      }
    case 'SET_COPIED_DESIGN':
      return { ...state, copiedDesign: action.payload }
    case 'SET_UNSAVED_CHANGES':
      return { ...state, unsavedChanges: action.payload }
    default:
      return state
  }
}
