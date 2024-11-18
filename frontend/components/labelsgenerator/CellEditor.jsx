import React, { useEffect, useRef } from 'react'
import * as fabric from 'fabric'

const CellEditor = ({
  initialContent,
  cellWidth,
  cellHeight,
  onSave,
  cellId,
  linkedGroup,
  dispatch
}) => {
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

    // Synchronisation des modifications
    const handleObjectModified = () => {
      const updatedContent = canvas.getObjects('i-text').map((iText) => ({
        id: iText.id,
        left: iText.left,
        top: iText.top
      }))

      // Synchroniser la mise en page avec les cellules liées
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

    canvas.on('object:modified', handleObjectModified)

    return () => {
      canvas.dispose() // Nettoyage lors du démontage
    }
  }, [initialContent, cellWidth, cellHeight, cellId, linkedGroup, dispatch])

  const handleSave = () => {
    const canvas = canvasInstance.current
    if (!canvas) return

    // Récupérer les objets IText mis à jour
    const updatedContent = canvas.getObjects('i-text').map((iText) => ({
      id: iText.id,
      type: 'IText',
      text: iText.text,
      left: iText.left,
      top: iText.top,
      fontSize: iText.fontSize,
      fill: iText.fill
    }))

    // Sauvegarder les modifications
    onSave(updatedContent)
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <canvas
        ref={canvasRef}
        style={{
          border: '1px solid #ccc',
          display: 'block',
          margin: '0 auto'
        }}
      />
      <button onClick={handleSave} style={{ marginTop: '10px', padding: '5px 10px' }}>
        Sauvegarder
      </button>
    </div>
  )
}

export default CellEditor
