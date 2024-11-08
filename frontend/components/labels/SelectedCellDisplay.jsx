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
      let obj = canvas.getObjects().find((o) => o._objectType === objectType)

      if (!obj) {
        obj = new fabric.IText(text, {
          left: objectProperties[objectType].left,
          top: objectProperties[objectType].top,
          scaleX: objectProperties[objectType].scaleX,
          scaleY: objectProperties[objectType].scaleY,
          angle: objectProperties[objectType].angle,
          fontSize: parseInt(style.fontSize),
          fill: objectColors[objectType]
        })
        obj._objectType = objectType
        canvas.add(obj)
      } else {
        obj.set({
          text: text,
          left: objectProperties[objectType].left,
          top: objectProperties[objectType].top,
          scaleX: objectProperties[objectType].scaleX,
          scaleY: objectProperties[objectType].scaleY,
          angle: objectProperties[objectType].angle,
          fontSize: parseInt(style.fontSize),
          fill: objectColors[objectType]
        })
      }

      obj.off('modified') // Supprimer les anciens écouteurs pour éviter les doublons
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
    objectColors,
    dispatch,
    canvas,
    labelConfig,
    addQrCode
  ])

  return null
}

export default React.memo(SelectedCellDisplay)
