import { useEffect, useCallback, useContext, useRef } from 'react'
import * as fabric from 'fabric'
import { GridContext } from '../context/GridContext'

const useCanvasGridSync = (canvas) => {
  const { state, dispatch, findLinkedGroup } = useContext(GridContext)
  const { selectedCellId, cellContents } = state
  const isLoadingRef = useRef(false)
  const ignoreNextUpdateRef = useRef(false)
  const lastContentRef = useRef(null)

  const loadCanvasObjects = useCallback(() => {
    if (!canvas || isLoadingRef.current) return

    const currentContent = cellContents[selectedCellId]

    // Vérifier si le contenu a réellement changé
    if (JSON.stringify(lastContentRef.current) === JSON.stringify(currentContent)) {
      console.log('Contenu identique, skip du rechargement')
      return
    }

    lastContentRef.current = currentContent
    isLoadingRef.current = true
    ignoreNextUpdateRef.current = true

    console.log('Chargement des objets...')

    const currentBackgroundColor = canvas.backgroundColor
    canvas.clear()
    canvas.backgroundColor = currentBackgroundColor

    const newObjects = currentContent || []
    let pendingImages = 0

    newObjects.forEach((obj) => {
      const { type, ...fabricOptions } = obj

      if (type === 'image' && obj.src) {
        pendingImages++
        const img = new Image()

        img.onload = () => {
          if (!canvas) return // Canvas peut avoir été détruit

          const fabricImg = new fabric.Image(img, {
            ...fabricOptions,
            width: obj.width,
            height: obj.height
          })

          canvas.add(fabricImg)
          pendingImages--

          if (pendingImages === 0) {
            canvas.renderAll()
            isLoadingRef.current = false
            ignoreNextUpdateRef.current = false
          }
        }

        img.onerror = () => {
          pendingImages--
          if (pendingImages === 0) {
            isLoadingRef.current = false
            ignoreNextUpdateRef.current = false
          }
        }

        img.src = obj.src
      } else {
        let fabricObject

        if (type === 'i-text' || type === 'text') {
          fabricObject = new fabric.IText(obj.text || '', fabricOptions)
        } else if (type === 'textbox') {
          fabricObject = new fabric.Textbox(obj.text || '', fabricOptions)
        } else if (type === 'rect') {
          fabricObject = new fabric.Rect(fabricOptions)
        } else if (type === 'circle') {
          fabricObject = new fabric.Circle(fabricOptions)
        }

        if (fabricObject) {
          canvas.add(fabricObject)
        }
      }
    })

    // Si pas d'images à charger, on termine directement
    if (pendingImages === 0) {
      canvas.renderAll()
      isLoadingRef.current = false
      ignoreNextUpdateRef.current = false
    }
  }, [canvas, selectedCellId, cellContents])

  const handleCanvasModification = useCallback(() => {
    if (!canvas || !selectedCellId || isLoadingRef.current || ignoreNextUpdateRef.current) {
      return
    }

    const objects = canvas.getObjects()
    if (!objects || objects.length === 0) return

    const updatedObjects = objects
      .map((obj) => {
        if (!obj) return null

        const baseProperties = {
          id: obj.id || Date.now().toString(),
          left: obj.left || 0,
          top: obj.top || 0,
          fill: obj.fill,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1
        }

        if (obj.type === 'image') {
          return {
            ...baseProperties,
            type: 'image',
            src: obj.getSrc ? obj.getSrc() : obj._element?.src || '',
            width: obj.width || 0,
            height: obj.height || 0
          }
        } else if (obj.type === 'i-text' || obj.type === 'text') {
          return {
            ...baseProperties,
            type: 'i-text',
            text: obj.text || '',
            fontSize: obj.fontSize,
            fontFamily: obj.fontFamily
          }
        } else if (obj.type === 'textbox') {
          return {
            ...baseProperties,
            type: 'textbox',
            text: obj.text || '',
            fontSize: obj.fontSize,
            fontFamily: obj.fontFamily,
            width: obj.width
          }
        } else if (obj.type === 'rect') {
          return {
            ...baseProperties,
            type: 'rect',
            width: obj.width || 0,
            height: obj.height || 0
          }
        } else if (obj.type === 'circle') {
          return {
            ...baseProperties,
            type: 'circle',
            radius: obj.radius || 0
          }
        }

        return null
      })
      .filter(Boolean)

    lastContentRef.current = updatedObjects

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
        payload: { sourceId: selectedCellId, layout, findLinkedGroup }
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
