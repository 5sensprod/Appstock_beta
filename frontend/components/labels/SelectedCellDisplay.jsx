import React, { useEffect } from 'react'
import { useCellManagerContext } from '../../context/CellManagerContext'
import { useCanvas } from '../../context/CanvasContext'
import useAddQrCodeCsv from '../../hooks/useAddQrCodeCsv' // Importer le hook
import * as fabric from 'fabric'

const SelectedCellDisplay = () => {
  const { canvas, labelConfig } = useCanvas()
  const { state, dispatch } = useCellManagerContext()
  const { selectedCellIndex, cells, objectProperties, style, objectColors } = state
  const selectedCell = cells[selectedCellIndex]
  const addQrCode = useAddQrCodeCsv() // Utilisation du hook

  useEffect(() => {
    if (!canvas || !selectedCell) return

    // Efface le canvas avant d'ajouter les objets
    canvas.clear()

    // Appliquer la couleur de fond depuis labelConfig
    canvas.backgroundColor = labelConfig.backgroundColor || 'white'

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

    // Applique les changements pour chaque type d'objet
    updateOrCreateTextObject(selectedCell.name, 'name')
    updateOrCreateTextObject(`${selectedCell.price}€`, 'price')

    // Ajouter le QR code pour 'gencode' avec le hook
    addQrCode(selectedCell.gencode, () => {
      console.log('QR Code ajouté avec succès')
    })

    // Render le canvas
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
