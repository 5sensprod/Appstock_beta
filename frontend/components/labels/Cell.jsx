// components/labels/Cell.jsx

import React, { useRef, useState, useEffect } from 'react'
import { useCellManagerContext } from '../../context/CellManagerContext'
import * as fabric from 'fabric'

const Cell = ({ data }) => {
  const canvasRef = useRef(null)
  const { state, dispatch } = useCellManagerContext()
  const [, setTempProperties] = useState({})

  useEffect(() => {
    // Vérifie si la référence du canvas est disponible
    if (!canvasRef.current) return

    let canvas = canvasRef.current._fabricCanvas

    if (!canvas) {
      // Initialisation du canevas une seule fois
      canvas = new fabric.Canvas(canvasRef.current)
      canvasRef.current._fabricCanvas = canvas
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

        canvas.add(obj)

        // Stocker l'objet pour une utilisation future
        canvasRef.current._objects = canvasRef.current._objects || {}
        canvasRef.current._objects[objectType] = obj
      }

      // Créer les objets une seule fois
      createTextObject(data.name, 'name')
      createTextObject(`${data.price}€`, 'price')
      createTextObject(data.gencode, 'gencode')

      canvas.renderAll()
    } else {
      // Mettre à jour les objets existants
      const objects = canvasRef.current._objects
      if (objects) {
        ;['name', 'price', 'gencode'].forEach((objectType) => {
          const obj = objects[objectType]
          const objProperties = state.objectProperties[objectType]

          let text
          if (objectType === 'name') text = data.name
          else if (objectType === 'price') text = `${data.price}€`
          else if (objectType === 'gencode') text = data.gencode

          obj.set({
            text,
            left: objProperties.left,
            top: objProperties.top,
            scaleX: objProperties.scaleX,
            scaleY: objProperties.scaleY,
            angle: objProperties.angle,
            fontSize: parseInt(state.style.fontSize),
            fill: state.objectColors[objectType]
          })
          obj.setCoords()
        })
      }
      canvas.renderAll()
    }
  }, [data, state.objectProperties, state.style.fontSize, state.objectColors, dispatch])

  useEffect(() => {
    // Capture la valeur actuelle de canvasRef.current
    const canvasElement = canvasRef.current

    return () => {
      if (canvasElement && canvasElement._fabricCanvas) {
        canvasElement._fabricCanvas.dispose()
      }
    }
  }, [])

  return (
    <div className="cell rounded border border-gray-300 p-4 shadow-md">
      <canvas ref={canvasRef} width={180} height={100} />
    </div>
  )
}

export default React.memo(Cell)
