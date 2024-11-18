import React, { useEffect, useRef } from 'react'
import * as fabric from 'fabric'

const CellEditor = ({ initialContent, cellWidth, cellHeight, onSave }) => {
  const canvasRef = useRef(null) // Référence pour le canvas
  const iTextRefs = useRef([]) // Références pour tous les objets IText

  useEffect(() => {
    // Crée le canvas Fabric.js avec les dimensions de la cellule
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: cellWidth,
      height: cellHeight,
      backgroundColor: '#fff' // Fond blanc pour l'édition
    })

    // Ajouter le contenu initial
    if (Array.isArray(initialContent)) {
      // Cas où initialContent est un tableau d'objets IText
      initialContent.forEach((iTextData, idx) => {
        const iText = new fabric.IText(iTextData.text, {
          left: iTextData.left,
          top: iTextData.top,
          fontSize: iTextData.fontSize,
          fill: iTextData.fill
        })
        canvas.add(iText)
        iTextRefs.current[idx] = iText // Sauvegarder la référence
      })
    } else {
      // Cas où initialContent est une chaîne ou vide
      const iText = new fabric.IText(initialContent || 'Cliquez pour éditer', {
        left: 10,
        top: 10,
        fontSize: 14,
        fill: '#333'
      })
      canvas.add(iText)
      iTextRefs.current = [iText] // Sauvegarder la référence
    }

    // Nettoyage lors du démontage
    return () => {
      canvas.dispose()
    }
  }, [initialContent, cellWidth, cellHeight])

  const handleSave = () => {
    // Récupérer les propriétés mises à jour de chaque IText
    const updatedContent = iTextRefs.current.map((iText) => ({
      type: 'IText',
      text: iText.text,
      left: iText.left,
      top: iText.top,
      fontSize: iText.fontSize,
      fill: iText.fill
    }))

    onSave(updatedContent) // Sauvegarder le contenu mis à jour
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
