// SelectedCellDisplay.jsx

import React, { useEffect } from 'react'
import { useCellManagerContext } from '../../context/CellManagerContext'
import { useCanvas } from '../../context/CanvasContext'
import * as fabric from 'fabric'

const SelectedCellDisplay = () => {
  const { canvas, labelConfig } = useCanvas() // Récupère labelConfig
  const { state, dispatch } = useCellManagerContext()
  const { selectedCellIndex, cells, objectProperties, style, objectColors } = state
  const selectedCell = cells[selectedCellIndex]

  useEffect(() => {
    if (!canvas || !selectedCell) return

    // Récupérer ou créer les objets pour chaque type (name, price, gencode)
    const updateOrCreateObject = (text, objectType) => {
      // Cherche l'objet correspondant dans le canvas en utilisant une propriété personnalisée
      let obj = canvas.getObjects().find((o) => o._objectType === objectType)

      if (!obj) {
        // Si l'objet n'existe pas, créez-le
        obj = new fabric.IText(text, {
          left: objectProperties[objectType].left,
          top: objectProperties[objectType].top,
          scaleX: objectProperties[objectType].scaleX,
          scaleY: objectProperties[objectType].scaleY,
          angle: objectProperties[objectType].angle,
          fontSize: parseInt(style.fontSize),
          fill: objectColors[objectType]
        })

        // Ajout d'une propriété personnalisée pour identifier l'objet
        obj._objectType = objectType

        // Ajouter le nouvel objet au canvas
        canvas.add(obj)
      } else {
        // Si l'objet existe déjà, mettez à jour ses propriétés
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
    updateOrCreateObject(selectedCell.name, 'name')
    updateOrCreateObject(`${selectedCell.price}€`, 'price')
    updateOrCreateObject(selectedCell.gencode, 'gencode')

    // Render le canvas
    canvas.renderAll()
  }, [selectedCell, objectProperties, style.fontSize, objectColors, dispatch, canvas, labelConfig])

  return null // Pas besoin de retourner un canvas, car le canvas est centralisé dans CanvasControl
}

export default React.memo(SelectedCellDisplay)
