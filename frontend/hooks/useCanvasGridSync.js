import { useEffect, useCallback, useContext } from 'react'
import * as fabric from 'fabric'
import { useCanvas } from '../context/CanvasContext'
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

const useCanvasGridSync = () => {
  const { canvas } = useCanvas() // Accéder au canvas et sa référence
  const { state, dispatch, findLinkedGroup } = useContext(GridContext)
  const { selectedCellId, cellContents } = state

  // Charger les objets sur le canvas à partir de cellContents
  const loadCanvasObjects = useCallback(() => {
    if (!canvas) return

    // Si aucun contenu n'est lié à la cellule sélectionnée, vider le canvas
    if (!selectedCellId || !cellContents[selectedCellId]?.length) {
      canvas.clear()
      canvas.renderAll()
      return
    }

    const newObjects = convertCellContentToCanvasObjects(cellContents[selectedCellId])

    const previousActiveObject = canvas.getActiveObject() // Sauvegarder l'objet actif

    // Vider le canvas existant et charger les nouveaux objets
    canvas.clear()
    newObjects.forEach((obj) => {
      const { text, ...fabricOptions } = obj
      const fabricObject = new fabric.IText(text, fabricOptions)
      canvas.add(fabricObject)
    })

    // Restaurer l'objet actif basé sur l'ID si nécessaire
    if (previousActiveObject) {
      const restoredObject = canvas.getObjects().find((obj) => obj.id === previousActiveObject.id)
      if (restoredObject) {
        canvas.setActiveObject(restoredObject)
      }
    }

    canvas.renderAll()
  }, [canvas, selectedCellId, cellContents])

  // Gérer les modifications sur le canvas et mettre à jour cellContents
  const handleCanvasModification = useCallback(() => {
    if (!canvas || !selectedCellId) return

    const updatedObjects = canvas.getObjects().map((obj) => ({
      id: obj.id,
      type: obj.type,
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

    // Mettre à jour le contenu de la cellule sélectionnée dans le GridContext
    dispatch({
      type: 'UPDATE_CELL_CONTENT',
      payload: { id: selectedCellId, content: updatedObjects }
    })

    // Synchroniser les cellules liées si nécessaire
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

  // Effet principal pour gérer la synchronisation
  useEffect(() => {
    if (!canvas) return

    // Charger les objets initiaux sur le canvas
    loadCanvasObjects()

    // Ajouter des gestionnaires d'événements pour détecter les modifications
    const events = ['object:modified', 'object:added', 'object:removed']
    events.forEach((event) => canvas.on(event, handleCanvasModification))

    return () => {
      // Nettoyer les gestionnaires d'événements lors du démontage
      events.forEach((event) => canvas.off(event, handleCanvasModification))
    }
  }, [canvas, loadCanvasObjects, handleCanvasModification])
}

export default useCanvasGridSync
