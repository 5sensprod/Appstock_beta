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
  }
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
          ...action.payload // Mise à jour partielle de labelConfig
        }
      }
    case 'SET_ZOOM':
      return { ...state, zoomLevel: action.payload }
    case 'SET_SELECTED_OBJECT':
      return { ...state, selectedObject: action.payload }
    case 'SET_COLOR':
      if (state.selectedObject) {
        state.selectedObject.set('fill', action.payload)
        state.canvas.renderAll()
      }
      return { ...state, selectedColor: action.payload }
    case 'SET_FONT':
      if (
        state.selectedObject &&
        (state.selectedObject.type === 'i-text' || state.selectedObject.type === 'textbox')
      ) {
        state.selectedObject.set('fontFamily', action.payload)
        state.canvas.renderAll()
      }
      return { ...state, selectedFont: action.payload }
    default:
      return state
  }
}
