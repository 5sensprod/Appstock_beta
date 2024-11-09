// components/labels/SelectedCellDisplay.jsx

import React, { useEffect } from 'react'
import { useCellManagerContext } from '../../context/CellManagerContext'
import { useCanvas } from '../../context/CanvasContext'
import useAddText from '../../hooks/useAddText'
import useAddQrCodeCsv from '../../hooks/useAddObjetsCsv'

const SelectedCellDisplay = () => {
  const { canvas, labelConfig } = useCanvas()
  const { state, dispatch } = useCellManagerContext()
  const { selectedCellIndex, cells, objectProperties, objectColors, objectFonts, style } = state
  const selectedCell = cells[selectedCellIndex]
  const addQrCode = useAddQrCodeCsv()

  const { onAddTextCsv } = useAddText(canvas, labelConfig)

  useEffect(() => {
    if (!canvas || !selectedCell) return

    if (canvas.backgroundColor !== (labelConfig.backgroundColor || 'white')) {
      canvas.setBackgroundColor(labelConfig.backgroundColor || 'white')
    }

    const addOrUpdateTextObject = async (text, objectType) => {
      const objectProp = objectProperties[objectType]
      const fontFamily = objectFonts[objectType] || style.fontFamily || 'Lato'
      const fillColor = objectColors[objectType] || style.textColor || '#000000'
      const fontSize = parseInt(style.fontSize) || 14

      let obj = canvas.getObjects().find((o) => o._objectType === objectType)

      if (!obj) {
        obj = await onAddTextCsv(text, fontFamily, fillColor, fontSize)
        if (obj) {
          obj._objectType = objectType
          obj.set({
            left: objectProp.left || 0,
            top: objectProp.top || 0,
            scaleX: objectProp.scaleX || 1,
            scaleY: objectProp.scaleY || 1,
            angle: objectProp.angle || 0
          })

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
      } else {
        // Mettre à jour uniquement le texte pour préserver les modifications de police et de couleur
        obj.set({
          text: text || ''
        })
      }
    }

    addOrUpdateTextObject(selectedCell.name, 'name')
    addOrUpdateTextObject(`${selectedCell.price}€`, 'price')

    addQrCode(selectedCell.gencode, () => {
      console.log('QR Code mis à jour avec succès')
    })

    canvas.renderAll()
  }, [
    selectedCell,
    objectProperties,
    objectFonts,
    objectColors,
    style.fontSize,
    style.fontFamily,
    style.textColor,
    dispatch,
    canvas,
    labelConfig,
    addQrCode,
    onAddTextCsv
  ])

  return null
}

export default React.memo(SelectedCellDisplay)
