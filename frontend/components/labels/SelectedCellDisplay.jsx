// frontend/components/labels/SelectedCellDisplay.jsx

import React, { useEffect, useMemo } from 'react'
import { useCellManagerContext } from '../../context/CellManagerContext'
import { useCanvas } from '../../context/CanvasContext'
import useAddText from '../../hooks/useAddText'
import useAddQrCodeCsv from '../../hooks/useAddObjetsCsv'
import { useGrid } from '../../context/GridContext'

const SelectedCellDisplay = () => {
  const { canvas, labelConfig } = useCanvas()
  const { gridState } = useGrid()
  const { selectedCell } = gridState
  const { state, dispatch } = useCellManagerContext()
  const { cells, objectProperties, objectColors, objectFonts, style } = state
  const addQrCode = useAddQrCodeCsv()
  const { onAddTextCsv } = useAddText(canvas, labelConfig)

  const selectedCellData = useMemo(() => cells[selectedCell] || {}, [cells, selectedCell])

  useEffect(() => {
    if (!canvas || !labelConfig) {
      console.warn('Canvas ou labelConfig non encore prêt. Arrêt de SelectedCellDisplay.')
      return
    }

    // Assurer que le fond blanc est appliqué systématiquement
    canvas.backgroundColor = labelConfig.backgroundColor || 'white'
    canvas.renderAll()

    const hasContent = selectedCellData.name || selectedCellData.price || selectedCellData.gencode
    if (!hasContent) {
      // Supprimer uniquement les objets sans retirer le fond
      canvas.getObjects().forEach((obj) => canvas.remove(obj))
      canvas.renderAll()
      return
    }

    const addOrUpdateTextObject = async (text, objectType) => {
      const objectProp = objectProperties[objectType] || {}
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
        obj.set({ text: text || '' })
      }
    }

    if (selectedCellData.name) addOrUpdateTextObject(selectedCellData.name, 'name')
    if (selectedCellData.price) addOrUpdateTextObject(`${selectedCellData.price}€`, 'price')
    if (selectedCellData.gencode) {
      addQrCode(selectedCellData.gencode, () => {
        console.log('QR Code mis à jour avec succès')
      })
    }

    canvas.renderAll()
  }, [
    selectedCellData,
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
