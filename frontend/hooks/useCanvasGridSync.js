import { useEffect, useCallback, useContext } from 'react'
import * as fabric from 'fabric'
import { GridContext } from '../context/GridContext'

// Conversion des données de contenu en objets Fabric.js
const convertCellContentToCanvasObjects = (cellContent) => {
  return cellContent.map((item) => {
    const commonProperties = {
      id: item.id,
      left: item.left,
      top: item.top,
      fill: item.fill,
      angle: item.angle || 0,
      scaleX: item.scaleX || 1,
      scaleY: item.scaleY || 1
    }

    if (item.type === 'i-text' || item.type === 'text') {
      return {
        ...commonProperties,
        text: item.text,
        fontSize: item.fontSize,
        fontFamily: item.fontFamily || 'Arial',
        type: 'i-text'
      }
    } else if (item.type === 'textbox') {
      return {
        ...commonProperties,
        text: item.text,
        fontSize: item.fontSize,
        fontFamily: item.fontFamily || 'Arial',
        width: item.width || 200,
        type: 'textbox'
      }
    } else if (item.type === 'rect') {
      return {
        ...commonProperties,
        width: item.width || 50,
        height: item.height || 50,
        type: 'rect'
      }
    } else if (item.type === 'circle') {
      return {
        ...commonProperties,
        radius: item.radius || 25,
        type: 'circle'
      }
    } else if (item.type === 'image') {
      return {
        ...commonProperties,
        src: item.src,
        width: item.width || 100,
        height: item.height || 100,
        type: 'image'
      }
    }

    throw new Error(`Type d'objet non pris en charge : ${item.type}`)
  })
}

const useCanvasGridSync = (canvas) => {
  const { state, dispatch, findLinkedGroup } = useContext(GridContext)
  const { selectedCellId, cellContents } = state

  const loadCanvasObjects = useCallback(() => {
    if (!canvas) return

    if (!selectedCellId || !cellContents[selectedCellId]?.length) {
      canvas.clear()
      canvas.renderAll()
      return
    }

    const newObjects = convertCellContentToCanvasObjects(cellContents[selectedCellId])

    const previousActiveObject = canvas.getActiveObject()
    canvas.clear()

    newObjects.forEach((obj) => {
      let fabricObject

      const { type, ...fabricOptions } = obj

      if (type === 'i-text' || type === 'text') {
        fabricObject = new fabric.IText(obj.text, fabricOptions)
      } else if (type === 'textbox') {
        fabricObject = new fabric.Textbox(obj.text, fabricOptions)
      } else if (type === 'rect') {
        fabricObject = new fabric.Rect(fabricOptions)
      } else if (type === 'circle') {
        fabricObject = new fabric.Circle(fabricOptions)
      } else if (type === 'image') {
        fabric.Image.fromURL(obj.src, (img) => {
          img.set({
            ...fabricOptions,
            width: obj.width,
            height: obj.height
          })
          canvas.add(img)
        })
        return
      } else {
        console.warn(`Type d'objet non géré : ${type}`)
        return
      }

      canvas.add(fabricObject)
    })

    if (previousActiveObject) {
      const restoredObject = canvas.getObjects().find((obj) => obj.id === previousActiveObject.id)
      if (restoredObject) {
        canvas.setActiveObject(restoredObject)
      }
    }

    canvas.renderAll()
  }, [canvas, selectedCellId, cellContents])

  const handleCanvasModification = useCallback(() => {
    if (!canvas || !selectedCellId) return

    const updatedObjects = canvas.getObjects().map((obj) => {
      const baseProperties = {
        id: obj.id,
        left: obj.left,
        top: obj.top,
        fill: obj.fill,
        angle: obj.angle || 0,
        scaleX: obj.scaleX,
        scaleY: obj.scaleY
      }

      if (obj.type === 'i-text') {
        return {
          ...baseProperties,
          type: 'i-text',
          text: obj.text,
          fontSize: obj.fontSize,
          fontFamily: obj.fontFamily
        }
      } else if (obj.type === 'textbox') {
        return {
          ...baseProperties,
          type: 'textbox',
          text: obj.text,
          fontSize: obj.fontSize,
          fontFamily: obj.fontFamily,
          width: obj.width
        }
      } else if (obj.type === 'rect') {
        return {
          ...baseProperties,
          type: 'rect',
          width: obj.width * obj.scaleX,
          height: obj.height * obj.scaleY
        }
      } else if (obj.type === 'circle') {
        return {
          ...baseProperties,
          type: 'circle',
          radius: obj.radius * obj.scaleX
        }
      } else if (obj.type === 'image') {
        return {
          ...baseProperties,
          type: 'image',
          src: obj.getSrc(), // Utilise la méthode getSrc pour obtenir l'URL de l'image
          width: obj.width * obj.scaleX,
          height: obj.height * obj.scaleY
        }
      }

      throw new Error(`Type d'objet non pris en charge : ${obj.type}`)
    })

    dispatch({
      type: 'SET_OBJECTS',
      payload: updatedObjects
    })

    dispatch({
      type: 'UPDATE_CELL_CONTENT',
      payload: { id: selectedCellId, content: updatedObjects }
    })

    const linkedGroup = findLinkedGroup(selectedCellId)
    if (linkedGroup && linkedGroup.length > 1) {
      const layout = updatedObjects.reduce((acc, item) => {
        acc[item.id] = {
          left: item.left,
          top: item.top,
          fill: item.fill,
          scaleX: item.scaleX,
          scaleY: item.scaleY,
          fontFamily: item.fontFamily,
          angle: item.angle || 0
        }
        return acc
      }, {})

      dispatch({
        type: 'SYNC_CELL_LAYOUT',
        payload: { sourceId: selectedCellId, layout }
      })
    }
  }, [canvas, selectedCellId, dispatch, findLinkedGroup])

  useEffect(() => {
    if (!canvas) return

    loadCanvasObjects()

    const events = ['object:modified', 'object:added', 'object:removed']
    events.forEach((event) => canvas.on(event, handleCanvasModification))

    return () => {
      events.forEach((event) => canvas.off(event, handleCanvasModification))
    }
  }, [canvas, loadCanvasObjects, handleCanvasModification])

  return {
    handleCanvasModification // Expose la fonction pour CanvasContext
  }
}

export default useCanvasGridSync
