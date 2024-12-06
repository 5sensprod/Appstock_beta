export const initialCanvasState = {
  canvas: null,
  zoomLevel: 1,
  selectedObject: null,
  selectedColor: '#000000',
  selectedFont: 'Lato',
  selectedStroke: {
    color: '#000000',
    width: 1,
    dashArray: null
  },
  gradientProperties: {
    type: 'none',
    colors: ['#000000', '#ffffff'],
    direction: 0
  },
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

    case 'SAVE_CANVAS_STATE':
      return {
        ...state,
        canvasState: action.payload
      }
    case 'SET_OBJECT_PROPERTIES':
      return {
        ...state,
        selectedColor: action.payload.fill || action.payload.color || state.selectedColor,
        selectedFont: action.payload.font || state.selectedFont,
        gradientProperties: {
          ...state.gradientProperties,
          type: action.payload.gradientType || state.gradientProperties.type,
          colors: action.payload.gradientColors || state.gradientProperties.colors,
          direction:
            action.payload.gradientDirection !== undefined
              ? action.payload.gradientDirection
              : state.gradientProperties.direction
        }
      }

    case 'SET_STROKE_PROPERTIES':
      return {
        ...state,
        selectedStroke: {
          ...state.selectedStroke,
          ...(action.payload.stroke && { color: action.payload.stroke }),
          ...(action.payload.strokeWidth !== undefined && { width: action.payload.strokeWidth }),
          ...(action.payload.strokeDashArray !== undefined && {
            dashArray: action.payload.strokeDashArray
          })
        }
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
