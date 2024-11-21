// frontend/reducers/canvasReducer.js

export const initialCanvasState = {
  canvas: null,
  zoomLevel: 1,
  selectedObject: null,
  selectedColor: '#000000',
  selectedFont: 'Lato',
  backgroundColor: 'white',
  labelConfig: {},
  objects: [],
  nextObjectId: 1
}

export const canvasReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CANVAS':
      return { ...state, canvas: action.payload }

    case 'SET_LABEL_CONFIG':
      return {
        ...state,
        labelConfig: {
          ...state.labelConfig,
          ...action.payload
        }
      }

    case 'SET_OBJECTS':
      console.log('Action CanvasReducer SET_OBJECTS déclenchée avec payload :', action.payload)
      return {
        ...state,
        objects: action.payload
      }

    case 'SET_ZOOM':
      return { ...state, zoomLevel: action.payload }

    case 'SET_SELECTED_OBJECT':
      return { ...state, selectedObject: action.payload }

    case 'SET_OBJECT_PROPERTIES':
      return {
        ...state,
        selectedColor: action.payload.color || state.selectedColor,
        selectedFont: action.payload.font || state.selectedFont
      }

    default:
      return state
  }
}
