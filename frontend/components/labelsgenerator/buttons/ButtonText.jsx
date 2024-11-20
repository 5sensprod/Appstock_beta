import React from 'react'
import IconButton from '../../ui/IconButton'
import { faFont } from '@fortawesome/free-solid-svg-icons'
import * as fabric from 'fabric'

const ButtonText = ({ cellId, linkedGroup, canvasInstance, dispatch }) => {
  const addNewIText = () => {
    const canvas = canvasInstance.current
    if (canvas) {
      const iText = new fabric.IText('Nouveau texte', {
        left: 10,
        top: 10,
        angle: 0,
        fontSize: 16,
        fill: '#000',
        fontFamily: 'Lato',
        editable: true,
        id: Math.random().toString(36).substr(2, 9) // Génère un ID unique
      })
      canvas.add(iText)
      canvas.setActiveObject(iText)

      // Sauvegarde immédiate après ajout
      const updatedContent = canvas.getObjects('i-text').map((obj) => ({
        id: obj.id || Math.random().toString(36).substr(2, 9),
        type: 'IText',
        text: obj.text,
        left: obj.left,
        top: obj.top,
        fontSize: obj.fontSize,
        fontFamily: obj.fontFamily,
        fill: obj.fill
      }))

      dispatch({
        type: 'UPDATE_CELL_CONTENT',
        payload: { id: cellId, content: updatedContent }
      })

      // Synchroniser les autres cellules du groupe
      if (linkedGroup && linkedGroup.length > 1) {
        linkedGroup.forEach((linkedCellId) => {
          if (linkedCellId !== cellId) {
            dispatch({
              type: 'UPDATE_CELL_CONTENT',
              payload: { id: linkedCellId, content: updatedContent }
            })
          }
        })
      }
    }
  }

  return (
    <IconButton
      onClick={addNewIText}
      icon={faFont}
      title="Ajouter Texte"
      className={`bg-blue-600 ${!cellId ? 'cursor-not-allowed opacity-50' : ''}`}
      size="w-10 h-10"
      iconSize="text-lg"
      disabled={!cellId} // Désactiver si aucune cellule sélectionnée
    />
  )
}

export default ButtonText
