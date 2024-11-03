import React, { useRef, useEffect, useCallback } from 'react'
import * as fabric from 'fabric'
import { useCellManagerContext } from '../../context/CellManagerContext'
import _ from 'lodash'

const CellContainer = () => {
  const { state } = useCellManagerContext()

  return (
    <div className="cell-container flex flex-wrap gap-4 p-4">
      {state.cells.map((cell, index) => (
        <Cell key={index} data={cell} />
      ))}
    </div>
  )
}

const Cell = React.memo(({ data }) => {
  const canvasRef = useRef(null)
  const fabricRef = useRef(null)
  const { state, dispatch } = useCellManagerContext()
  const debounceRef = useRef(null)

  // Initialiser le debounce une fois
  useEffect(() => {
    debounceRef.current = _.debounce((objectType, properties) => {
      dispatch({
        type: 'UPDATE_OBJECT_PROPERTIES',
        payload: {
          objectType,
          ...properties
        }
      })
    }, 100)
  }, [dispatch])

  // Fonction qui utilise le debounce
  const updateGlobalProperties = useCallback((objectType, properties) => {
    debounceRef.current(objectType, properties)
  }, [])

  const createTextObject = useCallback(
    (text, objectType) => {
      const objProperties = state.objectProperties[objectType]

      const textObject = new fabric.IText(text, {
        left: objProperties.left,
        top: objProperties.top,
        scaleX: objProperties.scaleX,
        scaleY: objProperties.scaleY,
        angle: objProperties.angle,
        fontSize: parseInt(state.style.fontSize),
        fill: state.objectColors[objectType],
        selectable: true,
        hasControls: true
      })

      textObject.on('moving', () => {
        updateGlobalProperties(objectType, {
          left: textObject.left,
          top: textObject.top
        })
      })

      textObject.on('scaling', () => {
        updateGlobalProperties(objectType, {
          scaleX: textObject.scaleX,
          scaleY: textObject.scaleY
        })
      })

      textObject.on('rotating', () => {
        updateGlobalProperties(objectType, {
          angle: textObject.angle
        })
      })

      return textObject
    },
    [state.objectProperties, state.style.fontSize, state.objectColors, updateGlobalProperties]
  )

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current) return

    if (fabricRef.current) {
      fabricRef.current.dispose()
    }

    const canvas = new fabric.Canvas(canvasRef.current)
    fabricRef.current = canvas
    canvas.setDimensions({ width: 180, height: 100 })

    const nameText = createTextObject(data.name, 'name')
    const priceText = createTextObject(`${data.price}€`, 'price')
    const gencodeText = createTextObject(data.gencode, 'gencode')

    canvas.add(nameText, priceText, gencodeText)

    requestAnimationFrame(() => canvas.renderAll())

    return () => {
      canvas.dispose()
    }
  }, [data, createTextObject])

  useEffect(() => {
    return renderCanvas()
  }, [renderCanvas])

  useEffect(() => {
    if (!fabricRef.current) return

    const canvas = fabricRef.current
    canvas.getObjects().forEach((obj, index) => {
      const objectType = index === 0 ? 'name' : index === 1 ? 'price' : 'gencode'
      const properties = state.objectProperties[objectType]

      obj.set({
        left: properties.left,
        top: properties.top,
        scaleX: properties.scaleX,
        scaleY: properties.scaleY,
        angle: properties.angle,
        fill: state.objectColors[objectType],
        fontSize: parseInt(state.style.fontSize)
      })
    })

    requestAnimationFrame(() => canvas.renderAll())
  }, [state.objectProperties, state.objectColors, state.style.fontSize])

  return (
    <div className="cell rounded border border-gray-300 p-4 shadow-md">
      <canvas ref={canvasRef} width={180} height={100} />
    </div>
  )
})

export default CellContainer
