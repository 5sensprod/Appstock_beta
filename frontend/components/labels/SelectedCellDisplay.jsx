// SelectedCellDisplay.jsx

import React, { useEffect, useState } from 'react'
import { useCellManagerContext } from '../../context/CellManagerContext'
import { useCanvas } from '../../context/CanvasContext'
import * as fabric from 'fabric'

const SelectedCellDisplay = () => {
  const { canvas, labelConfig } = useCanvas() // Récupère labelConfig
  const { state, dispatch } = useCellManagerContext()
  const { selectedCellIndex, cells, objectProperties, style, objectColors } = state
  const selectedCell = cells[selectedCellIndex]
  const [, setTempProperties] = useState({})

  useEffect(() => {
    if (!canvas || !selectedCell) return

    // Efface le canvas avant d'ajouter les objets
    canvas.clear()

    // Appliquer la couleur de fond depuis labelConfig
    canvas.backgroundColor = labelConfig.backgroundColor || 'white'

    const createTextObject = (text, objectType) => {
      const objProperties = objectProperties[objectType]

      const obj = new fabric.IText(text, {
        left: objProperties.left,
        top: objProperties.top,
        scaleX: objProperties.scaleX,
        scaleY: objProperties.scaleY,
        angle: objProperties.angle,
        fontSize: parseInt(style.fontSize),
        fill: objectColors[objectType]
      })

      // Mise à jour des propriétés en temps réel pendant les interactions
      obj.on('moving', () => {
        setTempProperties({
          left: obj.left,
          top: obj.top,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle
        })
      })

      obj.on('scaling', () => {
        setTempProperties({
          left: obj.left,
          top: obj.top,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle
        })
      })

      obj.on('rotating', () => {
        setTempProperties({
          left: obj.left,
          top: obj.top,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle
        })
      })

      // Synchroniser les modifications de design avec le contexte
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

      canvas.add(obj)
    }

    // Ajouter les éléments de texte basés sur les données de la cellule sélectionnée
    createTextObject(selectedCell.name, 'name')
    createTextObject(`${selectedCell.price}€`, 'price')
    createTextObject(selectedCell.gencode, 'gencode')

    // Rendre le canvas après avoir ajouté tous les objets et appliqué la couleur de fond
    canvas.renderAll()
  }, [selectedCell, objectProperties, style.fontSize, objectColors, dispatch, canvas, labelConfig])

  return null // Pas besoin de retourner un canvas, car le canvas est centralisé dans CanvasControl
}

export default React.memo(SelectedCellDisplay)
