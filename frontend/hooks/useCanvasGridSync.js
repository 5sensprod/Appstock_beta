import { useEffect, useCallback, useContext, useRef } from 'react'
import * as fabric from 'fabric'
import { GridContext } from '../context/GridContext'
import _ from 'lodash' // Pour simplifier les comparaisons

const useCanvasGridSync = (canvas) => {
  const { state, dispatch, findLinkedGroup } = useContext(GridContext)
  const { selectedCellId, cellContents } = state
  const isLoadingRef = useRef(false)
  const ignoreNextUpdateRef = useRef(false)
  const lastContentRef = useRef(null)

  // Fonction pour créer des objets Fabric
  const createFabricObject = (obj, canvas) => {
    const { type, isQRCode = false, qrText = '', ...fabricOptions } = obj // Inclure `qrText`

    if (type === 'image' && obj.src) {
      const img = new Image()
      img.src = obj.src
      return new Promise((resolve, reject) => {
        img.onload = () => {
          const fabricImage = new fabric.Image(img, {
            ...fabricOptions,
            width: obj.width,
            height: obj.height
          })

          // Associer `isQRCode` et `qrText` à l'objet Fabric
          fabricImage.isQRCode = isQRCode
          fabricImage.qrText = qrText

          resolve(fabricImage)
        }
        img.onerror = reject
      })
    }

    switch (type) {
      case 'i-text':
      case 'text':
        return Promise.resolve(new fabric.IText(obj.text || '', fabricOptions))
      case 'textbox':
        return Promise.resolve(new fabric.Textbox(obj.text || '', fabricOptions))
      case 'rect':
        return Promise.resolve(new fabric.Rect(fabricOptions))
      case 'circle':
        return Promise.resolve(new fabric.Circle(fabricOptions))
      default:
        return Promise.resolve(null)
    }
  }

  // Fonction pour charger les objets sur le canvas
  const loadCanvasObjects = useCallback(async () => {
    if (!canvas || isLoadingRef.current) return

    const currentContent = cellContents[selectedCellId]
    if (_.isEqual(lastContentRef.current, currentContent)) {
      console.log('Contenu identique, skip du rechargement')
      return
    }

    lastContentRef.current = currentContent
    isLoadingRef.current = true
    ignoreNextUpdateRef.current = true

    const currentBackgroundColor = canvas.backgroundColor
    const previousActiveObject = canvas.getActiveObject()

    canvas.clear()
    canvas.backgroundColor = currentBackgroundColor

    const newObjects = currentContent || []
    const fabricObjects = await Promise.all(
      newObjects.map((obj) => createFabricObject(obj, canvas))
    )

    fabricObjects.forEach((fabricObject) => {
      if (fabricObject) canvas.add(fabricObject)
    })

    if (previousActiveObject) {
      const restoredObject = canvas.getObjects().find((o) => o.id === previousActiveObject.id)
      if (restoredObject) canvas.setActiveObject(restoredObject)
    }

    canvas.renderAll()
    isLoadingRef.current = false
    ignoreNextUpdateRef.current = false
  }, [canvas, selectedCellId, cellContents])

  // Fonction pour synchroniser les modifications du canvas
  const handleCanvasModification = useCallback(() => {
    if (!canvas || !selectedCellId || isLoadingRef.current || ignoreNextUpdateRef.current) return

    const objects = canvas.getObjects()
    const updatedObjects = objects
      .map((obj) => {
        const baseProperties = {
          id: obj.id || Date.now().toString(),
          left: obj.left || 0,
          top: obj.top || 0,
          fill: obj.fill,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1
        }

        switch (obj.type) {
          case 'image':
            return {
              ...baseProperties,
              type: 'image',
              src: obj.getSrc ? obj.getSrc() : obj._element?.src || '',
              width: obj.width || 0,
              height: obj.height || 0,
              isQRCode: obj.isQRCode || false, // Inclure `isQRCode`
              qrText: obj.qrText || '' // Inclure `qrText`
            }
          case 'i-text':
          case 'text':
            return {
              ...baseProperties,
              type: 'i-text',
              text: obj.text || '',
              fontSize: obj.fontSize,
              fontFamily: obj.fontFamily
            }
          case 'textbox':
            return {
              ...baseProperties,
              type: 'textbox',
              text: obj.text || '',
              fontSize: obj.fontSize,
              fontFamily: obj.fontFamily,
              width: obj.width
            }
          case 'rect':
            return {
              ...baseProperties,
              type: 'rect',
              width: obj.width || 0,
              height: obj.height || 0
            }
          case 'circle':
            return {
              ...baseProperties,
              type: 'circle',
              radius: obj.radius || 0
            }
          default:
            return null
        }
      })
      .filter(Boolean)

    lastContentRef.current = updatedObjects

    dispatch({
      type: 'UPDATE_CELL_CONTENT',
      payload: { id: selectedCellId, content: updatedObjects }
    })

    // Synchronisation des groupes liés
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
        payload: { sourceId: selectedCellId, layout, linkedGroup }
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
      lastContentRef.current = null
      isLoadingRef.current = false
      ignoreNextUpdateRef.current = false
    }
  }, [canvas, loadCanvasObjects, handleCanvasModification])

  return {
    handleCanvasModification
  }
}

export default useCanvasGridSync
