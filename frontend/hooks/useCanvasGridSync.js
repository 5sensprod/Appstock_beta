import { useEffect, useCallback, useContext, useRef } from 'react'
import * as fabric from 'fabric'
import QRCode from 'qrcode'
import { GridContext } from '../context/GridContext'
import _ from 'lodash'

const useCanvasGridSync = (canvas) => {
  const { state, dispatch, findLinkedGroup } = useContext(GridContext)
  const { selectedCellId, cellContents } = state
  const isLoadingRef = useRef(false)
  const ignoreNextUpdateRef = useRef(false)
  const lastContentRef = useRef(null)

  const createFabricObject = useCallback(async (obj) => {
    const { type, isQRCode = false, qrText = '', ...fabricOptions } = obj

    // Gestion des QR codes existants ou nouveaux
    if (isQRCode || obj.id?.startsWith('Gencode-')) {
      // Réutilisation d'un QR code existant
      if (obj.src) {
        return new Promise((resolve) => {
          const img = new Image()
          img.onload = () => {
            const fabricImage = new fabric.Image(img, {
              ...fabricOptions,
              width: obj.width || 50,
              height: obj.height || 50,
              isQRCode: true,
              qrText: obj.qrText || qrText,
              src: obj.src
            })

            // Extension de la sérialisation pour QR codes
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
          img.onerror = () => resolve(null)
          img.src = obj.src
        })
      }

      // Génération d'un nouveau QR code
      return new Promise((resolve) => {
        const textToEncode = obj.text || obj.qrText || qrText
        if (!textToEncode) {
          console.error('Texte manquant pour le QR Code')
          return resolve(null)
        }

        QRCode.toDataURL(
          textToEncode,
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
                ...fabricOptions,
                width: 50,
                height: 50,
                isQRCode: true,
                qrText: textToEncode,
                src: url
              })

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
            img.onerror = () => resolve(null)
            img.src = url
          }
        )
      })
    }

    // Gestion des images standard
    if (type === 'image' && obj.src) {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          const fabricImage = new fabric.Image(img, {
            ...fabricOptions,
            width: obj.width,
            height: obj.height
          })
          resolve(fabricImage)
        }
        img.onerror = () => resolve(null)
        img.src = obj.src
      })
    }

    // Autres types d'objets
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
  }, [])

  const loadCanvasObjects = useCallback(async () => {
    if (!canvas || isLoadingRef.current) return

    const currentContent = cellContents[selectedCellId]
    const currentObjects = canvas
      .getObjects()
      .map((obj) => obj.toObject(['id', 'type', 'left', 'top', 'fill']))

    if (_.isEqual(currentObjects, currentContent)) return

    isLoadingRef.current = true
    ignoreNextUpdateRef.current = true

    const activeObject = canvas.getActiveObject()
    canvas.clear()
    canvas.backgroundColor ||= 'white'

    if (currentContent?.length) {
      const objects = await Promise.all(currentContent.map(createFabricObject))
      objects.filter(Boolean).forEach((obj) => canvas.add(obj))

      const reselectedObject =
        activeObject && canvas.getObjects().find((o) => o.id === activeObject.id)
      if (reselectedObject) canvas.setActiveObject(reselectedObject)
    }

    canvas.renderAll()
    lastContentRef.current = currentContent
    isLoadingRef.current = false
    ignoreNextUpdateRef.current = false
  }, [canvas, selectedCellId, cellContents, createFabricObject])

  // Nouvelle fonction pour générer le QR code et retourner son URL
  const generateQRCodeURL = async (text) => {
    try {
      return await QRCode.toDataURL(text, {
        width: 50,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      })
    } catch (error) {
      console.error('Erreur génération QR code:', error)
      return null
    }
  }

  // Effet pour initialiser les QR codes avec leurs URLs
  useEffect(() => {
    const initializeQRCodes = async () => {
      if (!cellContents) return

      for (const [cellId, content] of Object.entries(cellContents)) {
        if (!content || !Array.isArray(content)) continue

        const hasQRCode = content.some((obj) => obj.id?.startsWith('Gencode-'))
        if (!hasQRCode) continue

        const updatedContent = await Promise.all(
          content.map(async (obj) => {
            if (!obj.id?.startsWith('Gencode-')) return obj

            // Générer l'URL du QR code si elle n'existe pas
            if (!obj.src) {
              const url = await generateQRCodeURL(obj.text || obj.qrText)
              if (url) {
                return {
                  ...obj,
                  type: 'image',
                  src: url,
                  isQRCode: true,
                  qrText: obj.text || obj.qrText,
                  width: obj.width || 50,
                  height: obj.height || 50,
                  left: obj.left || 0,
                  top: obj.top || 0,
                  scaleX: obj.scaleX || 1,
                  scaleY: obj.scaleY || 1
                }
              }
            }
            return obj
          })
        )

        if (!_.isEqual(content, updatedContent)) {
          dispatch({
            type: 'UPDATE_CELL_CONTENT',
            payload: { id: cellId, content: updatedContent }
          })
        }
      }
    }

    initializeQRCodes()
  }, [cellContents])

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

        // Préservation du format image pour les QR codes
        if (obj.isQRCode) {
          return {
            ...baseProperties,
            type: 'image',
            src: obj._element?.src || obj.src,
            width: obj.width || 50,
            height: obj.height || 50,
            isQRCode: true,
            qrText: obj.qrText,
            id: obj.id.startsWith('Gencode-') ? obj.id : `Gencode-${Date.now()}`
          }
        }

        switch (obj.type) {
          case 'image':
            return {
              ...baseProperties,
              type: 'image',
              src: obj.getSrc?.() || obj._element?.src || '',
              width: obj.width || 0,
              height: obj.height || 0,
              isQRCode: obj.isQRCode || false,
              qrText: obj.qrText || ''
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

    if (_.isEqual(lastContentRef.current, updatedObjects)) return
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
