import React, { useEffect, useRef } from 'react'
import * as fabric from 'fabric'

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

  const addNewIText = () => {
    const canvas = canvasInstance.current
    if (canvas) {
      const iText = new fabric.IText('Nouveau texte', {
        left: 10,
        top: 10,
        fontSize: 16,
        fill: '#000',
        editable: true
      })
      canvas.add(iText)
      canvas.setActiveObject(iText)

      // Appeler manuellement la logique de mise à jour
      const updatedContent = canvas.getObjects('i-text').map((obj) => ({
        id: obj.id || Math.random().toString(36).substr(2, 9), // Générer un ID unique si nécessaire
        type: 'IText',
        text: obj.text,
        left: obj.left,
        top: obj.top,
        fontSize: obj.fontSize,
        fill: obj.fill
      }))

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
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <button
        onClick={addNewIText}
        style={{
          display: 'block',
          margin: '10px auto',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Ajouter un objet IText
      </button>
      <canvas
        ref={canvasRef}
        style={{
          border: '1px solid #ccc',
          display: 'block',
          margin: '0 auto'
        }}
      />
    </div>
  )
}

export default CellEditor
