import React, { useEffect, useRef, useContext } from 'react'
import * as fabric from 'fabric'
import { GridContext } from '../../context/GridContext'

const CellEditor = ({ initialContent, cellWidth, cellHeight, onSave }) => {
  const canvasRef = useRef(null) // Référence pour le canvas
  const canvasInstance = useRef(null) // Instance Fabric.js
  const { state } = useContext(GridContext)

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: cellWidth,
      height: cellHeight,
      backgroundColor: '#fff'
    })
    canvasInstance.current = canvas

    // Utiliser initialContent ou le contenu par défaut du contexte
    const contentToLoad = initialContent ?? state.cellContents.default

    contentToLoad.forEach((iTextData) => {
      const iText = new fabric.IText(iTextData.text, {
        left: iTextData.left,
        top: iTextData.top,
        fontSize: iTextData.fontSize,
        fill: iTextData.fill,
        editable: true // Permettre l'édition
      })
      canvas.add(iText)
    })

    return () => {
      canvas.dispose() // Nettoyage lors du démontage
    }
  }, [initialContent, cellWidth, cellHeight, state.cellContents])

  const handleSave = () => {
    const canvas = canvasInstance.current
    if (!canvas) return

    // Récupérer les objets IText mis à jour
    const updatedContent = canvas.getObjects('i-text').map((iText) => ({
      type: 'IText',
      text: iText.text,
      left: iText.left,
      top: iText.top,
      fontSize: iText.fontSize,
      fill: iText.fill
    }))
    onSave(updatedContent) // Sauvegarder les modifications
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
