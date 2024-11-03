import { useReducer, useCallback } from 'react'
import { cellReducer, initialState } from '../reducers/cellReducer'
import * as fabric from 'fabric'

const useCellManager = () => {
  const [state, dispatch] = useReducer(cellReducer, initialState)

  const importData = useCallback((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const rows = text.split('\n').filter((row) => row.trim())
      const cells = rows.slice(1).map((row) => {
        const [name = '', price = '0', gencode = ''] = row.split(',').map((val) => val.trim())
        return { name, price, gencode }
      })
      dispatch({ type: 'IMPORT_DATA', payload: cells })
    }
    reader.readAsText(file)
  }, [])

  const updateStyle = (property, value) => {
    dispatch({ type: 'UPDATE_STYLE', payload: { [property]: value } })
  }

  const updateObjectColor = (objectType, color) => {
    dispatch({ type: 'UPDATE_OBJECT_COLOR', payload: { objectType, color } })
  }

  const renderCell = useCallback(
    (data, canvasRef, setTempProperties) => {
      if (!canvasRef) return

      if (canvasRef._fabricCanvas) {
        canvasRef._fabricCanvas.dispose()
      }

      const canvas = new fabric.Canvas(canvasRef)
      canvasRef._fabricCanvas = canvas
      canvas.setDimensions({ width: 180, height: 100 })

      const createTextObject = (text, objectType) => {
        const objProperties = state.objectProperties[objectType]

        const obj = new fabric.IText(text, {
          left: objProperties.left,
          top: objProperties.top,
          scaleX: objProperties.scaleX,
          scaleY: objProperties.scaleY,
          angle: objProperties.angle,
          fontSize: parseInt(state.style.fontSize),
          fill: state.objectColors[objectType]
        })

        // Mise à jour de l'état local pendant l'interaction
        obj.on('moving', () => {
          setTempProperties({
            left: obj.left,
            top: obj.top,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            angle: obj.angle
          })
        })

        obj.on('scaling', () => {
          setTempProperties({
            left: obj.left,
            top: obj.top,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            angle: obj.angle
          })
        })

        obj.on('rotating', () => {
          setTempProperties({
            left: obj.left,
            top: obj.top,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            angle: obj.angle
          })
        })

        // Synchronisation des propriétés finales avec l'état global
        obj.on('modified', () => {
          dispatch({
            type: 'UPDATE_OBJECT_PROPERTIES',
            payload: {
              objectType,
              left: obj.left,
              top: obj.top,
              scaleX: obj.scaleX,
              scaleY: obj.scaleY,
              angle: obj.angle
            }
          })
        })

        return obj
      }

      const nameText = createTextObject(data.name, 'name')
      const priceText = createTextObject(`${data.price}€`, 'price')
      const gencodeText = createTextObject(data.gencode, 'gencode')

      canvas.add(nameText, priceText, gencodeText)
      canvas.renderAll()
    },
    [state.objectProperties, state.style.fontSize, state.objectColors]
  )

  return {
    state,
    importData,
    updateStyle,
    updateObjectColor,
    renderCell
  }
}

export default useCellManager
