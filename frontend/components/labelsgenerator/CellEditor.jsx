import React, { useEffect, useRef } from 'react'
import * as fabric from 'fabric'

const CellEditor = ({ initialContent, cellWidth, cellHeight, onSave }) => {
  const canvasRef = useRef(null) // Utiliser une référence pour le canvas
  const textObjectRef = useRef(null) // Référence pour le IText

  useEffect(() => {
    // Crée le canvas Fabric.js avec les dimensions de la cellule
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: cellWidth,
      height: cellHeight,
      backgroundColor: '#fff' // Fond clair pour l'édition
    })

    // Ajoute un objet IText avec le contenu initial
    const iText = new fabric.IText(initialContent || 'Cliquez pour éditer', {
      left: 10,
      top: 10,
      fontSize: 14,
      fill: '#333'
    })
    canvas.add(iText)
    textObjectRef.current = iText

    // Nettoyage lors du démontage
    return () => {
      canvas.dispose()
    }
  }, [initialContent, cellWidth, cellHeight])

  const handleSave = () => {
    const textObject = textObjectRef.current
    if (textObject) {
      const content = {
        type: 'IText',
        text: textObject.text,
        left: textObject.left,
        top: textObject.top,
        fontSize: textObject.fontSize,
        fill: textObject.fill
      }
      onSave(content)
    }
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
