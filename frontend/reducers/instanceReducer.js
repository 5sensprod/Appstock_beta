// frontend/reducers/instanceReducer.js

export const initialInstanceState = {
  selectedCell: 0,
  selectedCells: [],
  totalCells: 0,
  copiedDesign: null,
  objects: {} // Assurez-vous que `objects` est initialisé ici
}

export const instanceReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SELECTED_CELL':
      return { ...state, selectedCell: action.payload }
    case 'SET_SELECTED_CELLS':
      return { ...state, selectedCells: action.payload }
    case 'SET_TOTAL_CELLS':
      return { ...state, totalCells: action.payload }
    case 'SET_COPIED_DESIGN':
      return { ...state, copiedDesign: action.payload }
    case 'SET_OBJECTS': // Ajoutez une action pour gérer `objects`
      return { ...state, objects: action.payload }
    case 'SAVE_CELL_DESIGN': {
      const { cellIndex, design } = action.payload
      return {
        ...state,
        objects: { ...state.objects, [cellIndex]: design }
      }
    }
    case 'CLEAR_CELL_DESIGN': {
      const updatedObjects = { ...state.objects }
      delete updatedObjects[action.payload.cellIndex] // Retire l'entrée pour la cellule

      return {
        ...state,
        objects: updatedObjects
      }
    }
    default:
      return state
  }
}
