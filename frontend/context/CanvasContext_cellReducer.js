import React, { createContext, useReducer } from 'react'
import * as fabric from 'fabric'

export const CanvasContext = createContext()

const initialState = {
  canvas: null, // Instance Fabric.js
  objects: [] // Objets sauvegardés liés au canvas
}

function canvasReducer(state, action) {
  switch (action.type) {
    case 'SET_CANVAS':
      return {
        ...state,
        canvas: action.payload
      }

    case 'ADD_OBJECT': {
      const { canvas } = state
      if (canvas) {
        const newObject = new fabric.IText(action.payload.props.text, action.payload.props)
        canvas.add(newObject)
        canvas.setActiveObject(newObject)
        canvas.renderAll()
      }
      return state
    }

    case 'UPDATE_OBJECTS':
      return {
        ...state,
        objects: action.payload
      }

    default:
      return state
  }
}

export const CanvasProvider = ({ children }) => {
  const [state, dispatch] = useReducer(canvasReducer, initialState)

  return <CanvasContext.Provider value={{ state, dispatch }}>{children}</CanvasContext.Provider>
}
