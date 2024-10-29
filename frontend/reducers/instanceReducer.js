// frontend/reducers/instanceReducer.js

export const initialInstanceState = {
  selectedCell: 0,
  selectedCells: [],
  totalCells: 0,
  copiedDesign: null,
  objects: {},
  linkedCells: {}
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
    case 'SET_OBJECTS':
      console.log('Instance SET_OBJECTS déclenchée avec payload :', action.payload)
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
    case 'IMPORT_CSV_DATA':
      return { ...state, objects: { ...state.objects, ...action.payload } }

    case 'ADD_LINKED_CELLS': {
      const { primaryCell, linkedCellIndices } = action.payload
      console.log('Linked Cells Added:', primaryCell, [primaryCell, ...linkedCellIndices]) // Vérification de la structure complète
      return {
        ...state,
        linkedCells: {
          ...state.linkedCells,
          [primaryCell]: [primaryCell, ...linkedCellIndices] // Inclure la cellule principale elle-même
        }
      }
    }
    case 'UPDATE_LINKED_CELLS': {
      const { primaryCell, design } = action.payload
      const updatedObjects = { ...state.objects }

      // Mettez à jour chaque cellule associée avec le nouveau design
      if (state.linkedCells[primaryCell]) {
        state.linkedCells[primaryCell].forEach((cellIndex) => {
          updatedObjects[cellIndex] = design
        })
      }

      return {
        ...state,
        objects: updatedObjects
      }
    }

    default:
      return state
  }
}
