// frontend/reducers/instanceReducer.js

export const initialInstanceState = {
  selectedCell: 0,
  selectedCells: [],
  totalCells: 0,
  copiedDesign: null,
  objects: {}, // Directement en tant qu'objets Fabric.js
  linkedCells: {},
  unsavedChanges: false
}

export const instanceReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SELECTED_CELL':
      return { ...state, selectedCell: action.payload, unsavedChanges: true }
    case 'SET_SELECTED_CELLS':
      return { ...state, selectedCells: action.payload, unsavedChanges: true }
    case 'SET_TOTAL_CELLS':
      return { ...state, totalCells: action.payload, unsavedChanges: true }
    case 'SET_COPIED_DESIGN':
      return { ...state, copiedDesign: action.payload, unsavedChanges: true }
    case 'SET_OBJECTS':
      console.log('Instance SET_OBJECTS déclenchée avec payload :', action.payload)
      return { ...state, objects: action.payload, unsavedChanges: true }
    case 'SAVE_CELL_DESIGN': {
      const { cellIndex, design } = action.payload
      console.log('Instance SAVE_CELL_DESIGN déclenchée avec payload :', action.payload)
      return {
        ...state,
        objects: { ...state.objects, [cellIndex]: design },
        unsavedChanges: true
      }
    }
    case 'CLEAR_CELL_DESIGN': {
      const updatedObjects = { ...state.objects }
      delete updatedObjects[action.payload.cellIndex]
      return {
        ...state,
        objects: updatedObjects,
        unsavedChanges: true
      }
    }
    case 'IMPORT_CSV_DATA':
      return { ...state, objects: { ...state.objects, ...action.payload }, unsavedChanges: true }

    case 'ADD_LINKED_CELLS': {
      const { primaryCell, linkedCellIndices } = action.payload
      console.log('Linked Cells Added:', primaryCell, [primaryCell, ...linkedCellIndices])
      return {
        ...state,
        linkedCells: {
          ...state.linkedCells,
          [primaryCell]: [primaryCell, ...linkedCellIndices]
        },
        unsavedChanges: true
      }
    }
    case 'UPDATE_LINKED_CELLS': {
      const { primaryCell, design } = action.payload
      const updatedObjects = { ...state.objects }

      // Récupérer la liste des cellules liées
      const linkedCells = state.linkedCells[primaryCell]

      if (linkedCells) {
        linkedCells.forEach((cellIndex) => {
          updatedObjects[cellIndex] = design // Appliquer le même design à chaque cellule liée
        })
      }

      return {
        ...state,
        objects: updatedObjects
      }
    }

    case 'RESET_UNSAVED_CHANGES':
      return { ...state, unsavedChanges: false }

    default:
      return state
  }
}
