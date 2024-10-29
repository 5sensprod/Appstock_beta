// frontend/reducers/canvasReducer.js

export const initialCanvasState = {
  canvas: null,
  zoomLevel: 1,
  selectedObject: null,
  selectedColor: '#000000',
  selectedFont: 'Lato',
  backgroundColor: 'white',
  labelConfig: {
    labelWidth: 48.5,
    labelHeight: 25.5,
    offsetTop: 22,
    offsetLeft: 8,
    spacingVertical: 0,
    spacingHorizontal: 0
  },
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
      console.log('Action SET_OBJECTS déclenchée avec payload :', action.payload)
      return {
        ...state,
        objects: action.payload
      }

    case 'SET_ZOOM':
      return { ...state, zoomLevel: action.payload }

    case 'SET_SELECTED_OBJECT':
      return { ...state, selectedObject: action.payload }

    case 'SET_COLOR':
      return { ...state, selectedColor: action.payload }

    case 'SET_FONT':
      return { ...state, selectedFont: action.payload }

    // Nouvelle action pour regrouper la mise à jour de l'objet sélectionné, couleur et police
    case 'UPDATE_SELECTED_OBJECT':
      return {
        ...state,
        selectedObject: action.payload.object,
        selectedColor: action.payload.color,
        selectedFont: action.payload.font
      }

    default:
      return state
  }
}
