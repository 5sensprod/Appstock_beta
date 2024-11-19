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

    contentToLoad.forEach((objectData) => {
      const { type, ...rest } = objectData // Exclure `type` pour éviter l'erreur
      let fabricObject

      switch (type) {
        case 'Rect':
          fabricObject = new fabric.Rect(rest)
          break
        case 'Circle':
          fabricObject = new fabric.Circle(rest)
          break
        case 'Image':
          fabric.Image.fromURL(rest.src, (img) => {
            img.set(rest)
            canvas.add(img)
          })
          return
        default:
          fabricObject = new fabric.IText(rest.text, rest) // Ne passez pas `type` ici
      }

      canvas.add(fabricObject)
    })

    // Sauvegarde et synchronisation lors de la modification
    const saveCanvasContent = () => {
      const updatedContent = canvas.getObjects().map((obj) => {
        const baseData = obj.toObject(['id', 'type'])
        if (obj.type === 'Image') {
          baseData.src = obj._element?.src || ''
        }
        return baseData
      })

      dispatch({
        type: 'UPDATE_CELL_CONTENT',
        payload: { id: cellId, content: updatedContent }
      })

      // Synchroniser les cellules liées si applicable
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

    canvas.on('object:modified', saveCanvasContent)
    canvas.on('object:added', saveCanvasContent)
    canvas.on('object:removed', saveCanvasContent)

    return () => {
      canvas.dispose() // Nettoyage lors du démontage
    }
  }, [initialContent, cellWidth, cellHeight, cellId, linkedGroup, dispatch])

  const addNewObject = (type) => {
    const canvas = canvasInstance.current
    if (!canvas) return

    let newObject
    switch (type) {
      case 'Rect':
        newObject = new fabric.Rect({
          left: 10,
          top: 10,
          width: 50,
          height: 50,
          fill: 'rgba(255, 0, 0, 0.5)',
          id: Math.random().toString(36).substr(2, 9)
        })
        break
      case 'Circle':
        newObject = new fabric.Circle({
          left: 10,
          top: 10,
          radius: 30,
          fill: 'rgba(0, 0, 255, 0.5)',
          id: Math.random().toString(36).substr(2, 9)
        })
        break
      case 'Image':
        fabric.Image.fromURL('https://via.placeholder.com/100', (img) => {
          img.set({
            left: 10,
            top: 10,
            scaleX: 0.5,
            scaleY: 0.5,
            id: Math.random().toString(36).substr(2, 9),
            type: 'Image'
          })
          canvas.add(img)
          canvas.setActiveObject(img)
        })
        return
      default:
        newObject = new fabric.IText('Nouveau texte', {
          left: 10,
          top: 10,
          fontSize: 16,
          fill: '#000',
          id: Math.random().toString(36).substr(2, 9)
        })
    }
    canvas.add(newObject)
    canvas.setActiveObject(newObject)
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        <button onClick={() => addNewObject('IText')}>Ajouter IText</button>
        <button onClick={() => addNewObject('Rect')}>Ajouter Rectangle</button>
        <button onClick={() => addNewObject('Circle')}>Ajouter Cercle</button>
        <button onClick={() => addNewObject('Image')}>Ajouter Image</button>
      </div>
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
