// cellReducer.js

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
    gencode: { left: 10, top: 70, scaleX: 1, scaleY: 1, angle: 0 }
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
  }
}

export const cellReducer = (state, action) => {
  switch (action.type) {
    case 'IMPORT_DATA':
      return { ...state, cells: action.payload }

    case 'UPDATE_CELL':
      return {
        ...state,
        cells: state.cells.map((cell, index) =>
          index === action.payload.index ? { ...cell, ...action.payload.data } : cell
        )
      }

    case 'UPDATE_STYLE':
      return { ...state, style: { ...state.style, ...action.payload } }

    case 'UPDATE_GLOBAL_STYLE': // Action pour mettre à jour les styles globaux
      return {
        ...state,
        globalStyle: { ...state.globalStyle, ...action.payload }
      }

    // Dans cellReducer.js
    case 'UPDATE_OBJECT_PROPERTIES':
      const { objectType, ...properties } = action.payload
      return {
        ...state,
        objectProperties: {
          ...state.objectProperties,
          [objectType]: {
            ...state.objectProperties[objectType],
            ...properties
          }
        }
      }
    case 'SYNC_OBJECT_PROPERTIES':
      return {
        ...state,
        objectProperties: action.payload
      }

    case 'UPDATE_OBJECT_COLOR':
      return {
        ...state,
        objectColors: {
          ...state.objectColors,
          [action.payload.objectType]: action.payload.color
        }
      }

    default:
      return state
  }
}
