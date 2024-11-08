// components/labels/SelectedCellDisplay.jsx

import React, { useEffect } from 'react'
import { useCellManagerContext } from '../../context/CellManagerContext'
import { useCanvas } from '../../context/CanvasContext'
import useAddQrCodeCsv from '../../hooks/useAddQrCodeCsv'
import * as fabric from 'fabric'

const SelectedCellDisplay = () => {
  const { canvas, labelConfig } = useCanvas()
  const { state, dispatch } = useCellManagerContext()
  const { selectedCellIndex, cells, objectProperties, style, objectColors } = state
  const selectedCell = cells[selectedCellIndex]
  const addQrCode = useAddQrCodeCsv()

  useEffect(() => {
    if (!canvas || !selectedCell) return

    // Mettre à jour la couleur de fond si elle a changé
    if (canvas.backgroundColor !== (labelConfig.backgroundColor || 'white')) {
      canvas.setBackgroundColor(labelConfig.backgroundColor || 'white')
    }

    const updateOrCreateTextObject = (text, objectType) => {
      // Vérifier que objectProperties[objectType] existe
      const objectProp = objectProperties[objectType]
      if (!objectProp) {
        console.error(`objectProperties pour ${objectType} est undefined`)
        return
      }

      let obj = canvas.getObjects().find((o) => o._objectType === objectType)

      if (!obj) {
        obj = new fabric.IText(text || '', {
          left: objectProp.left || 0,
          top: objectProp.top || 0,
          scaleX: objectProp.scaleX || 1,
          scaleY: objectProp.scaleY || 1,
          angle: objectProp.angle || 0,
          fontSize: parseInt(style.fontSize) || 14,
          fill: objectColors[objectType] || '#000000',
          fontFamily: style.fontFamily || 'Lato'
        })
        obj._objectType = objectType
        canvas.add(obj)
      } else {
        obj.set({
          text: text || '',
          left: objectProp.left || obj.left,
          top: objectProp.top || obj.top,
          scaleX: objectProp.scaleX || obj.scaleX,
          scaleY: objectProp.scaleY || obj.scaleY,
          angle: objectProp.angle || obj.angle,
          fontSize: parseInt(style.fontSize) || obj.fontSize,
          fill: objectColors[objectType] || obj.fill,
          fontFamily: style.fontFamily || obj.fontFamily
        })
      }

      obj.off('modified')
      obj.on('modified', () => {
        dispatch({
          type: 'UPDATE_OBJECT_PROPERTIES',
          payload: {
            objectType,
            left: obj.left,
            top: obj.top,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            angle: obj.angle
          }
        })
      })
    }

    // Mettre à jour ou créer les objets texte
    updateOrCreateTextObject(selectedCell.name, 'name')
    updateOrCreateTextObject(`${selectedCell.price}€`, 'price')

    // Mettre à jour le QR code
    addQrCode(selectedCell.gencode, () => {
      console.log('QR Code mis à jour avec succès')
    })

    // Rendre le canvas
    canvas.renderAll()
  }, [
    selectedCell,
    objectProperties,
    style.fontSize,
    style.fontFamily,
    objectColors,
    dispatch,
    canvas,
    labelConfig,
    addQrCode
  ])

  return null
}

export default React.memo(SelectedCellDisplay)
