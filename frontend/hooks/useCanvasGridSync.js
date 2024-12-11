import { useEffect, useCallback, useContext, useRef } from 'react'
import * as fabric from 'fabric'
import { GridContext } from '../context/GridContext'
import _ from 'lodash'
import { createQRCodeFabricImage, generateQRCodeImage } from '../utils/fabricUtils'
import {
  extractObjectProperties,
  TYPE_PROPERTY_GROUPS,
  extractQRCodeProperties
} from '../utils/objectPropertiesConfig'

const useCanvasGridSync = (canvas) => {
  const { state, dispatch, findLinkedGroup } = useContext(GridContext)
  const { selectedCellId, cellContents } = state
  const isLoadingRef = useRef(false)
  const ignoreNextUpdateRef = useRef(false)
  const lastContentRef = useRef(null)

  const createFabricObject = useCallback(async (obj) => {
    const { type, isQRCode = false, qrText = '', ...fabricOptions } = obj

    // Gestion des QR codes
    if (isQRCode || obj.id?.startsWith('Gencode-')) {
      if (obj.src) {
        // Réutiliser un QR code existant avec sa source
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

            // Ajout de propriétés supplémentaires pour la sérialisation
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
      } else {
        // Générer un nouveau QR code
        return createQRCodeFabricImage(qrText || obj.text, {
          color: '#000000',
          width: obj.width || 50,
          height: obj.height || 50,
          ...fabricOptions
        })
      }
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

    // Créer l'objet shadow si nécessaire
    if (obj.shadow) {
      // Changé ici
      fabricOptions.shadow = new fabric.Shadow(obj.shadow)
    }

    // Gestion des autres types d'objets Fabric
    switch (type) {
      case 'i-text':
      case 'text':
        return Promise.resolve(new fabric.IText(obj.text || '', fabricOptions))
      case 'textbox':
        return Promise.resolve(new fabric.Textbox(obj.text || '', fabricOptions))
      case 'rect':
        const rect = new fabric.Rect(fabricOptions)
        if (fabricOptions.fill && fabricOptions.fill.type) {
          rect.set({
            fill: fabricOptions.fill,
            gradientDirection: fabricOptions.gradientDirection
          })
        }
        return Promise.resolve(rect)

      case 'circle':
        const circle = new fabric.Circle(fabricOptions)
        if (fabricOptions.fill && fabricOptions.fill.type) {
          circle.set({
            fill: fabricOptions.fill,
            gradientDirection: fabricOptions.gradientDirection
          })
        }
        return Promise.resolve(circle)

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

    // Rétablir le fond blanc du canvas
    canvas.backgroundColor = 'white'

    if (currentContent?.length) {
      const objects = await Promise.all(currentContent.map(createFabricObject))
      objects.filter(Boolean).forEach((obj) => canvas.add(obj))

      const reselectedObject = canvas.getObjects().find((o) => o.id === activeObject?.id)
      if (reselectedObject) canvas.setActiveObject(reselectedObject)
    }

    canvas.renderAll()
    lastContentRef.current = currentContent
    isLoadingRef.current = false
    ignoreNextUpdateRef.current = false
  }, [canvas, selectedCellId, cellContents, createFabricObject])
  useEffect(() => {
    const synchronizeQRCodes = async () => {
      if (!selectedCellId || !cellContents[selectedCellId]) return

      const linkedGroup = findLinkedGroup(selectedCellId)
      if (!linkedGroup || linkedGroup.length <= 1) return

      const currentObjects = cellContents[selectedCellId]
      for (const cellId of linkedGroup) {
        if (cellId === selectedCellId) continue

        const cellContent = cellContents[cellId]
        const updatedContent = await Promise.all(
          cellContent.map(async (obj) => {
            if (obj.isQRCode) {
              try {
                const newSrc = await generateQRCodeImage(
                  obj.qrText,
                  obj.fill || '#000000',
                  obj.width || 50
                )
                return { ...obj, src: newSrc }
              } catch (err) {
                console.error('Erreur lors de la régénération des QR codes liés :', err)
              }
            }
            return obj
          })
        )

        if (!_.isEqual(cellContent, updatedContent)) {
          dispatch({
            type: 'UPDATE_CELL_CONTENT',
            payload: { id: cellId, content: updatedContent }
          })
        }
      }
    }

    synchronizeQRCodes()
  }, [selectedCellId, cellContents, dispatch, findLinkedGroup])

  // Effet pour initialiser les QR codes avec leurs URLs V1
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
              try {
                const url = await generateQRCodeImage(obj.text || obj.qrText, '#000000', 50)
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
              } catch (error) {
                console.error('Erreur lors de la génération de l’URL QR Code :', error)
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

  const handleCanvasModification = useCallback(async () => {
    if (!canvas || !selectedCellId || isLoadingRef.current || ignoreNextUpdateRef.current) return

    const objects = canvas.getObjects()

    // Créer une version sérialisée des objets actuels sur le canevas
    const updatedObjects = await Promise.all(
      objects.map(async (obj) => {
        const baseProperties = {
          ...extractObjectProperties(obj, ['basic', 'stroke', 'shadow']),
          opacity: obj.savedOpacity || obj.opacity || 1,
          zIndex: objects.indexOf(obj) / Math.max(1, objects.length - 1)
        }

        if (obj.isQRCode) {
          const qrText = obj.qrText
          const color = obj.fill || '#000000'

          // Important: Toujours régénérer le QR code si la couleur a changé
          const shouldRegenerateQR = obj.lastColor !== color

          try {
            let newQRCodeSrc = obj.src
            // Régénérer si la couleur a changé, même pour les QR codes liés par CSV
            if (shouldRegenerateQR) {
              newQRCodeSrc = await generateQRCodeImage(qrText, color, obj.width || 50)
              obj.lastColor = color // Sauvegarder la dernière couleur utilisée
            }

            return {
              ...baseProperties,
              type: 'image',
              src: newQRCodeSrc,
              width: obj.width || 50,
              height: obj.height || 50,
              isQRCode: true,
              qrText,
              fill: color, // Sauvegarder la couleur explicitement
              lastColor: color // Sauvegarder pour les comparaisons futures
            }
          } catch (error) {
            console.error('Erreur lors de la régénération du QR code :', error)
            return {
              ...baseProperties,
              type: 'image',
              src: obj.src,
              isQRCode: true,
              qrText,
              fill: color
            }
          }
        }

        // Retourner les propriétés selon le type avec extractObjectProperties
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
              ...extractObjectProperties(obj, ['text']),
              type: 'i-text'
            }
          case 'textbox':
            return {
              ...baseProperties,
              ...extractObjectProperties(obj, ['text']),
              type: 'textbox',
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
    )

    // Garder la logique originale intacte pour la partie de synchronisation
    const newObjects = updatedObjects.filter(
      (obj) => !lastContentRef.current?.some((prevObj) => prevObj.id === obj.id)
    )

    const removedObjects = lastContentRef.current
      ? lastContentRef.current.filter(
          (prevObj) => !updatedObjects.some((obj) => obj.id === prevObj.id)
        )
      : []

    lastContentRef.current = updatedObjects

    const linkedGroup = findLinkedGroup(selectedCellId)
    if (linkedGroup && linkedGroup.length > 1) {
      linkedGroup.forEach((cellId) => {
        if (cellId === selectedCellId) return

        const currentContent = cellContents[cellId] || []

        let synchronizedContent = currentContent.filter(
          (obj) => !removedObjects.some((removedObj) => removedObj.id === obj.id)
        )

        newObjects.forEach((newObj) => {
          if (!synchronizedContent.some((obj) => obj.id === newObj.id)) {
            synchronizedContent.push(newObj)
          }
        })

        // Conserver la logique originale pour le z-index
        synchronizedContent = synchronizedContent
          .map((obj) => {
            const sourceObj = updatedObjects.find((updated) => updated.id === obj.id)
            if (sourceObj) {
              return {
                ...obj,
                // Propriétés de base
                zIndex: sourceObj.zIndex,
                // Propriétés d'apparence
                opacity: sourceObj.opacity,
                gradientType: sourceObj.gradientType,
                gradientColors: sourceObj.gradientColors,
                gradientDirection: sourceObj.gradientDirection,
                // Conserver les props CSV si nécessaire
                ...(obj.linkedByCsv && {
                  linkedByCsv: true,
                  ...(obj.isQRCode && {
                    qrText: obj.qrText,
                    src: obj.src
                  })
                })
              }
            }
            return obj
          })
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

        if (!_.isEqual(currentContent, synchronizedContent)) {
          dispatch({
            type: 'UPDATE_CELL_CONTENT',
            payload: { id: cellId, content: synchronizedContent }
          })
        }
      })
    }

    dispatch({
      type: 'UPDATE_CELL_CONTENT',
      payload: { id: selectedCellId, content: updatedObjects }
    })

    // Garder la logique originale pour le layout
    if (linkedGroup && linkedGroup.length > 1) {
      const layout = updatedObjects.reduce((acc, item) => {
        acc[item.id] = {
          left: item.left,
          top: item.top,
          fill: item.fill,
          scaleX: item.scaleX,
          scaleY: item.scaleY,
          angle: item.angle || 0,
          opacity: item.savedOpacity || item.opacity || 1,
          fontFamily: item.fontFamily || 'Arial',
          fontSize: item.fontSize || 16,
          fontStyle: item.fontStyle || 'normal',
          fontWeight: item.fontWeight || 'normal',
          stroke: item.stroke || '#000000',
          strokeWidth: item.strokeWidth ?? 0,
          strokeDashArray: item.strokeDashArray || [],
          strokeUniform: true,
          strokeLineCap: item.strokeLineCap || 'butt',
          patternType: item.patternType || 'solid',
          patternDensity: item.patternDensity || 5,
          // Ajouter les propriétés d'ombre si elles existent déjà dans l'objet sérialisé
          ...(item.shadow && {
            shadow: item.shadow,
            shadowColor: item.shadowColor,
            shadowBlur: item.shadowBlur,
            shadowOffsetX: item.shadowOffsetX,
            shadowOffsetY: item.shadowOffsetY,
            shadowOpacity: item.shadowOpacity
          })
        }
        return acc
      }, {})

      dispatch({
        type: 'SYNC_CELL_LAYOUT',
        payload: { sourceId: selectedCellId, layout, linkedGroup }
      })
    }
  }, [canvas, selectedCellId, cellContents, dispatch, findLinkedGroup])

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
