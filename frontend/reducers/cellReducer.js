// reducers/cellReducer.js

export const initialState = {
  cells: [],
  style: {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontSize: '14px',
    fontFamily: 'Lato'
  },
  objectProperties: {
    name: { left: 10, top: 10, scaleX: 1, scaleY: 1, angle: 0 },
    price: { left: 10, top: 40, scaleX: 1, scaleY: 1, angle: 0 },
    gencode: { left: 40, top: 10, scaleX: 0.5, scaleY: 0.5, angle: 0 } // Définition des propriétés par défaut de gencode
  },
  objectColors: {
    name: '#000000',
    price: '#000000',
    gencode: '#000000'
  },
  objectFonts: {
    name: 'Lato',
    price: 'Lato'
  },
  globalStyle: {
    left: 10,
    top: 10,
    scaleX: 1,
    scaleY: 1,
    angle: 0
  },
  selectedCellIndex: 0 // Index de la cellule sélectionnée
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
      return { ...state, selectedCellIndex: payload }

    case 'UPDATE_OBJECT_FONT':
      return {
        ...state,
        objectFonts: {
          ...state.objectFonts,
          [payload.objectType]: payload.fontFamily
        }
      }

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
