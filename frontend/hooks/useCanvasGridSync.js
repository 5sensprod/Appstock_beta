import React, { useEffect, useContext, useCallback } from 'react'
import * as fabric from 'fabric'
import { useCanvas } from '../context/CanvasContext'
import { GridContext } from '../context/GridContext'

// Conversion des données de contenu en objets Fabric
function convertCellContentToCanvasObjects(cellContent) {
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

export default function CanvasControl() {
  const { canvasRef, canvas } = useCanvas()
  const { state, dispatch, findLinkedGroup } = useContext(GridContext)
  const { selectedCellId, cellContents } = state

  const loadCanvasObjects = useCallback(() => {
    if (!canvas) return

    // Si aucun contenu n'est lié à la cellule sélectionnée, vider le canvas
    if (
      !selectedCellId ||
      !cellContents[selectedCellId] ||
      cellContents[selectedCellId].length === 0
    ) {
      canvas.clear()
      canvas.renderAll()
      return
    }

    const newObjects = convertCellContentToCanvasObjects(cellContents[selectedCellId])

    const previousActiveObject = canvas.getActiveObject() // Sauvegarde l'objet actif

    // Supprimer les anciens objets et charger les nouveaux
    canvas.clear()
    newObjects.forEach((obj) => {
      const { text, ...fabricOptions } = obj
      const fabricObject = new fabric.IText(text, fabricOptions)
      canvas.add(fabricObject)
    })

    if (previousActiveObject) {
      // Restaurer l'objet actif basé sur l'ID
      const restoredObject = canvas.getObjects().find((obj) => obj.id === previousActiveObject.id)
      if (restoredObject) {
        canvas.setActiveObject(restoredObject)
      }
    }

    canvas.renderAll()
  }, [canvas, selectedCellId, cellContents])
  const handleCanvasModification = useCallback(() => {
    if (!canvas || !selectedCellId) return

    const previousActiveObject = canvas.getActiveObject() // Sauvegarde l'objet actif

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

    // Mettre à jour le contenu de la cellule sélectionnée
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

    // Restaurer l'objet actif après la mise à jour
    if (previousActiveObject) {
      const restoredObject = canvas.getObjects().find((obj) => obj.id === previousActiveObject.id)
      if (restoredObject) {
        canvas.setActiveObject(restoredObject)
      }
    }

    canvas.renderAll()
  }, [canvas, selectedCellId, dispatch, findLinkedGroup])

  useEffect(() => {
    if (!canvas) return

    // Charger les objets initiaux
    loadCanvasObjects()

    // Ajouter des gestionnaires d'événements pour détecter les modifications
    const events = ['object:modified', 'object:added', 'object:removed']
    events.forEach((event) => canvas.on(event, handleCanvasModification))

    return () => {
      // Nettoyer les gestionnaires d'événements
      events.forEach((event) => canvas.off(event, handleCanvasModification))
    }
  }, [canvas, loadCanvasObjects, handleCanvasModification])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ border: '1px solid #ccc', width: '100%', height: '100%' }} />
    </div>
  )
}
