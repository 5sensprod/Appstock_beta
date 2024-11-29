import { useEffect, useCallback, useContext, useRef } from 'react'
import { GridContext } from '../context/GridContext'
import * as fabric from 'fabric'
import QRCode from 'qrcode'
import _ from 'lodash'

const useCanvasSync = (canvas) => {
  const { state, dispatch, findLinkedGroup } = useContext(GridContext)
  const { selectedCellId, cellContents } = state
  const syncStateRef = useRef({
    isLoading: false,
    ignoreNextUpdate: false,
    lastContent: null,
    selectedCellId: null
  })

  const createFabricObject = async (obj) => {
    if (obj.id?.startsWith('Gencode-')) {
      return new Promise((resolve, reject) => {
        if (!obj.text) {
          console.error('Texte manquant pour le QR Code')
          return resolve(null)
        }

        QRCode.toDataURL(
          obj.text,
          {
            width: 50,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' }
          },
          (err, url) => {
            if (err) {
              console.error('QR Code error:', err)
              return resolve(null)
            }

            const img = new Image()
            img.onload = () => {
              const fabricImage = new fabric.Image(img, {
                ..._.omit(obj, ['type', 'text']),
                width: 50,
                height: 50,
                isQRCode: true,
                qrText: obj.text,
                src: url // Ajout de `src` pour l'export PDF
              })

              // Sérialisation étendue pour inclure `isQRCode` et `src`
              fabricImage.toObject = (function (toObject) {
                return function () {
                  return Object.assign(toObject.call(this), {
                    isQRCode: true,
                    qrText: this.qrText,
                    src: this._element?.src || this.src
                  })
                }
              })(fabricImage.toObject)

              resolve(fabricImage)
            }
            img.onerror = (loadError) => {
              console.error('Erreur lors du chargement de l’image QR:', loadError)
              resolve(null)
            }
            img.src = url
          }
        )
      })
    }

    if (obj.type === 'image' && obj.src) {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          const fabricImage = new fabric.Image(img, { ...obj })
          fabricImage.isQRCode = obj.isQRCode
          fabricImage.qrText = obj.qrText
          resolve(fabricImage)
        }
        img.onerror = (error) => {
          console.error('Erreur lors du chargement de l’image:', error)
          resolve(null)
        }
        img.src = obj.src
      })
    }

    const fabricOptions = _.omit(obj, ['type', 'text'])
    switch (obj.type) {
      case 'i-text':
        return new fabric.IText(obj.text || '', fabricOptions)
      case 'rect':
        return new fabric.Rect(fabricOptions)
      case 'circle':
        return new fabric.Circle(fabricOptions)
      default:
        return null
    }
  }

  useEffect(() => {
    if (!canvas) return

    const content = selectedCellId ? cellContents[selectedCellId] || [] : []

    const activeObject = canvas.getActiveObject() // Sauvegarde de l'objet actif
    syncStateRef.current.isLoading = true

    canvas.clear()
    canvas.backgroundColor = 'white'
    canvas.renderAll()

    Promise.all(content.map(createFabricObject)).then((objects) => {
      objects.filter(Boolean).forEach((obj) => canvas.add(obj))
      canvas.renderAll()

      // Restauration de l'objet actif
      if (activeObject) {
        const restoredObject = canvas.getObjects().find((obj) => obj.id === activeObject.id)
        if (restoredObject) {
          canvas.setActiveObject(restoredObject)
        }
      }

      syncStateRef.current.isLoading = false
    })

    syncStateRef.current.selectedCellId = selectedCellId
  }, [canvas, selectedCellId, cellContents])

  const handleCanvasModification = useCallback(() => {
    if (!canvas || !selectedCellId || syncStateRef.current.isLoading) return

    const activeObject = canvas.getActiveObject() // Sauvegarde de l'objet actif

    const serializedObjects = canvas
      .getObjects()
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

        if (obj.isQRCode) {
          return {
            ...baseProperties,
            type: 'i-text',
            text: obj.qrText,
            id: `Gencode-${Date.now()}`
          }
        }

        if (obj.type === 'image') {
          return {
            ...baseProperties,
            type: 'image',
            src: obj.getSrc?.() || obj._element?.src || '',
            width: obj.width || 0,
            height: obj.height || 0,
            isQRCode: obj.isQRCode || false,
            qrText: obj.qrText || ''
          }
        }

        const typeSpecificProps = {
          'i-text': {
            type: 'i-text',
            text: obj.text || '',
            fontSize: obj.fontSize,
            fontFamily: obj.fontFamily
          },
          rect: {
            type: 'rect',
            width: obj.width || 0,
            height: obj.height || 0
          },
          circle: {
            type: 'circle',
            radius: obj.radius || 0
          }
        }

        return obj.type in typeSpecificProps
          ? { ...baseProperties, ...typeSpecificProps[obj.type] }
          : null
      })
      .filter(Boolean)

    if (_.isEqual(syncStateRef.current.lastContent, serializedObjects)) return
    syncStateRef.current.lastContent = serializedObjects

    dispatch({
      type: 'UPDATE_CELL_CONTENT',
      payload: { id: selectedCellId, content: serializedObjects }
    })

    const linkedGroup = findLinkedGroup(selectedCellId)
    if (linkedGroup?.length > 1) {
      const layout = serializedObjects.reduce(
        (acc, item) => ({
          ...acc,
          [item.id.startsWith('Gencode-') ? 'Gencode' : item.id]: _.pick(item, [
            'left',
            'top',
            'fill',
            'scaleX',
            'scaleY',
            'fontFamily',
            'angle'
          ])
        }),
        {}
      )

      dispatch({
        type: 'SYNC_CELL_LAYOUT',
        payload: { sourceId: selectedCellId, layout }
      })
    }

    // Restauration de l'objet actif
    if (activeObject) {
      const restoredObject = canvas.getObjects().find((obj) => obj.id === activeObject.id)
      if (restoredObject) {
        canvas.setActiveObject(restoredObject)
      }
    }
  }, [canvas, selectedCellId, dispatch, findLinkedGroup])

  useEffect(() => {
    if (!canvas) return

    const events = ['object:modified', 'object:added', 'object:removed']
    events.forEach((event) => canvas.on(event, handleCanvasModification))

    return () => {
      events.forEach((event) => canvas.off(event, handleCanvasModification))
    }
  }, [canvas, handleCanvasModification])

  return { handleCanvasModification }
}

export default useCanvasSync
