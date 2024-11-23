export const initialCanvasState = {
  canvas: null,
  zoomLevel: 1,
  selectedObject: null,
  selectedColor: '#000000',
  selectedFont: 'Lato',
  labelConfig: {
    labelWidth: 48.5,
    labelHeight: 25,
    offsetTop: 22,
    offsetLeft: 8,
    spacingVertical: 0,
    spacingHorizontal: 0
  }
}
export const canvasReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CANVAS':
      return { ...state, canvas: action.payload }

    case 'SET_SELECTED_FONT':
      return {
        ...state,
        selectedFont: action.payload
      }

    case 'SET_LABEL_CONFIG':
      return {
        ...state,
        labelConfig: { ...state.labelConfig, ...action.payload }
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

    // Mise à jour des dimensions spécifiques
    case 'UPDATE_DIMENSIONS':
      return {
        ...state,
        ...action.payload
      }

    default:
      return state
  }
}
