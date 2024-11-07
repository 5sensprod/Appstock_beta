// reducers/cellReducer.js

export const initialState = {
  cells: [],
  style: {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontSize: '14px'
  },
  objectProperties: {
    name: { left: 10, top: 10, scaleX: 1, scaleY: 1, angle: 0 },
    price: { left: 10, top: 40, scaleX: 1, scaleY: 1, angle: 0 },
    gencode: { left: 10, top: 50, scaleX: 1, scaleY: 1, angle: 0 }
  },
  objectColors: {
    name: '#000000',
    price: '#000000',
    gencode: '#000000'
  },
  globalStyle: {
    left: 10,
    top: 10,
    scaleX: 1,
    scaleY: 1,
    angle: 0
  },
  selectedCellIndex: 0 // Ajout de l'index de la cellule sélectionnée
}

export const cellReducer = (state, action) => {
  const { type, payload } = action

  switch (type) {
    case 'IMPORT_DATA':
      return { ...state, cells: payload }

    case 'UPDATE_CELL':
      return {
        ...state,
        cells: state.cells.map((cell, index) =>
          index === payload.index ? { ...cell, ...payload.data } : cell
        )
      }

    case 'UPDATE_STYLE':
      return { ...state, style: { ...state.style, ...payload } }

    case 'UPDATE_GLOBAL_STYLE':
      return { ...state, globalStyle: { ...state.globalStyle, ...payload } }

    case 'UPDATE_OBJECT_PROPERTIES':
      return updateObjectProperties(state, payload)

    case 'SYNC_OBJECT_PROPERTIES':
      return { ...state, objectProperties: payload }

    case 'UPDATE_OBJECT_COLOR':
      return {
        ...state,
        objectColors: { ...state.objectColors, [payload.objectType]: payload.color }
      }

    case 'APPLY_GLOBAL_PROPERTIES':
      return {
        ...state,
        objectProperties: applyGlobalPropertiesToAll(state.objectProperties, payload)
      }

    case 'SELECT_CELL':
      return { ...state, selectedCellIndex: payload } // Ajout du cas SELECT_CELL

    default:
      return state
  }
}

// Fonction auxiliaire pour appliquer les propriétés globales à chaque type d'objet
function applyGlobalPropertiesToAll(objectProperties, globalProperties) {
  return Object.keys(objectProperties).reduce((newProperties, objectType) => {
    newProperties[objectType] = { ...objectProperties[objectType], ...globalProperties }
    return newProperties
  }, {})
}

// Fonction pour mettre à jour les propriétés d'un objet spécifique
function updateObjectProperties(state, { objectType, ...properties }) {
  return {
    ...state,
    objectProperties: {
      ...state.objectProperties,
      [objectType]: { ...state.objectProperties[objectType], ...properties }
    }
  }
}
