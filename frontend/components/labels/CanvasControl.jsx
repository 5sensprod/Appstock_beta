import React, { useEffect, useContext } from 'react'
import * as fabric from 'fabric'
import styles from './FabricDesigner.module.css'
import { useCanvas } from '../../context/CanvasContext'
import { GridContext } from '../../context/GridContext'

function convertCellContentToCanvasObjects(cellContent) {
  return cellContent.map((item) => ({
    // Fabric.js n'a pas besoin de "type", on ne l'inclut pas ici
    text: item.text,
    left: item.left,
    top: item.top,
    fontSize: item.fontSize,
    fill: item.fill,
    id: item.id, // Conservé pour traçabilité si nécessaire
    fontFamily: 'Arial', // Défaut si manquant
    angle: 0, // Fabric.js nécessite cet attribut
    editable: true // Permet l'édition dans Fabric.js
  }))
}

export default function CanvasControl() {
  const { canvasRef, canvas } = useCanvas() // Récupère l'instance Fabric.js et la référence du canvas
  const { state } = useContext(GridContext)
  const { selectedCellId, cellContents } = state

  useEffect(() => {
    if (canvas && selectedCellId && cellContents[selectedCellId]) {
      const objects = convertCellContentToCanvasObjects(cellContents[selectedCellId])

      canvas.clear() // Nettoyer le canevas avant de charger de nouveaux objets

      // Ajouter les objets au canevas
      objects.forEach((obj) => {
        const fabricObject = new fabric.IText(obj.text, { ...obj })
        canvas.add(fabricObject)
      })

      canvas.renderAll() // Forcer le rendu
    }
  }, [canvas, selectedCellId, cellContents])

  return (
    <div className={styles.canvasContainer}>
      <canvas ref={canvasRef} className={styles.sampleCanvas} />
    </div>
  )
}
