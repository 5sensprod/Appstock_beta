import { useEffect, useCallback, useContext } from 'react'
import * as fabric from 'fabric'
import { GridContext } from '../context/GridContext'

const useCanvasGridSync = (canvas) => {
  const { state, dispatch, findLinkedGroup } = useContext(GridContext)
  const { selectedCellId, cellContents } = state

  const loadCanvasObjects = useCallback(() => {
    if (!canvas) return

    // Sauvegarder le backgroundColor actuel
    const currentBackgroundColor = canvas.backgroundColor

    // Si aucun contenu dans la cellule sélectionnée, nettoyer le canevas
    if (!selectedCellId || !cellContents[selectedCellId]?.length) {
      canvas.clear()
      canvas.backgroundColor = currentBackgroundColor // Rétablir le backgroundColor
      canvas.renderAll()
      return
    }

    const newObjects = cellContents[selectedCellId]

    const previousActiveObject = canvas.getActiveObject()
    canvas.clear()

    // Rétablir le backgroundColor après le clear
    canvas.backgroundColor = currentBackgroundColor

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
        fabric.FabricImage.fromURL(obj.src, (img) => {
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
          width: obj.width,
          height: obj.height
        }
      } else if (obj.type === 'circle') {
        return {
          ...baseProperties,
          type: 'circle',
          radius: obj.radius
        }
      } else if (obj.type === 'image') {
        return {
          ...baseProperties,
          type: 'image',
          src: obj.getSrc(), // Utilise la méthode getSrc pour obtenir l'URL de l'image
          width: obj.width,
          height: obj.height
        }
      }

      throw new Error(`Type d'objet non pris en charge : ${obj.type}`)
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
