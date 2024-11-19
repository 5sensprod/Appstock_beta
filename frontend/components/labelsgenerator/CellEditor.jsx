import React, { useEffect, useRef } from 'react'
import * as fabric from 'fabric'
import styles from '../labels/FabricDesigner.module.css'
import ButtonText from './buttons/ButtonText'

const CellEditor = ({ initialContent, cellWidth, cellHeight, cellId, linkedGroup, dispatch }) => {
  const canvasRef = useRef(null) // Référence pour le canvas
  const canvasInstance = useRef(null) // Instance Fabric.js

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: cellWidth,
      height: cellHeight,
      backgroundColor: '#fff'
    })
    canvasInstance.current = canvas

    // Charger le contenu initial
    const contentToLoad = Array.isArray(initialContent) ? initialContent : []

    contentToLoad.forEach((iTextData) => {
      const { type, ...rest } = iTextData // Exclure `type`
      const iText = new fabric.IText(iTextData.text, {
        ...rest,
        editable: true // Permettre l'édition
      })
      canvas.add(iText)
    })

    // Sauvegarde et synchronisation lors de la modification
    const handleObjectModified = () => {
      const updatedContent = canvas.getObjects('i-text').map((iText) => ({
        id: iText.id,
        type: 'IText',
        text: iText.text,
        left: iText.left,
        top: iText.top,
        fontSize: iText.fontSize,
        fill: iText.fill
      }))

      // Mise à jour de la cellule via UPDATE_CELL_CONTENT
      dispatch({
        type: 'UPDATE_CELL_CONTENT',
        payload: { id: cellId, content: updatedContent }
      })

      // Synchroniser les cellules liées si applicable
      if (linkedGroup && linkedGroup.length > 1) {
        dispatch({
          type: 'SYNC_CELL_LAYOUT',
          payload: {
            sourceId: cellId,
            layout: updatedContent.reduce((acc, item) => {
              acc[item.id] = { left: item.left, top: item.top }
              return acc
            }, {})
          }
        })
      }
    }

    // Écoute les modifications d'objet
    canvas.on('object:modified', handleObjectModified)

    return () => {
      canvas.dispose() // Nettoyage lors du démontage
    }
  }, [initialContent, cellWidth, cellHeight, cellId, linkedGroup, dispatch])

  return (
    <>
      {' '}
      <div className="my-4">
        {' '}
        <ButtonText
          cellId={cellId}
          linkedGroup={linkedGroup}
          canvasInstance={canvasInstance} // Passe directement l'instance de canvas
          dispatch={dispatch}
        />
      </div>
      <div className={styles.canvasContainer}>
        {/* Bouton Ajouter Texte */}

        <canvas ref={canvasRef} className={styles.sampleCanvas} />
      </div>
    </>
  )
}

export default CellEditor
