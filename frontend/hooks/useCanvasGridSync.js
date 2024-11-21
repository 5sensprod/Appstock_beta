import { useEffect, useCallback, useContext } from 'react'
import * as fabric from 'fabric'
import { GridContext } from '../context/GridContext'

// Conversion des données de contenu en objets Fabric.js
const convertCellContentToCanvasObjects = (cellContent) => {
  return cellContent.map((item) => ({
    text: item.text,
    left: item.left,
    top: item.top,
    fontSize: item.fontSize,
    fill: item.fill,
    id: item.id,
    fontFamily: item.fontFamily || 'Arial',
    angle: item.angle || 0,
    scaleX: item.scaleX || 1,
    scaleY: item.scaleY || 1,
    editable: true
  }))
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
      const { text, ...fabricOptions } = obj
      const fabricObject = new fabric.IText(text, fabricOptions)
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
    // Récupérer les objets mis à jour
    const updatedObjects = canvas.getObjects().map((obj) => ({
      id: obj.id,
      text: obj.text,
      left: obj.left,
      top: obj.top,
      fontSize: obj.fontSize,
      fill: obj.fill,
      fontFamily: obj.fontFamily,
      angle: obj.angle || 0,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY
    }))

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
