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

    contentToLoad.forEach((item) => {
      const { type, ...rest } = item

      let fabricObject

      switch (type) {
        case 'IText':
          fabricObject = new fabric.IText(item.text || '', {
            ...rest,
            editable: true
          })
          break
        case 'rect': // Support pour `Rect`
        case 'Rect': // Ajout d'une gestion possible d'un `type` en majuscules
          fabricObject = new fabric.Rect({
            ...rest
          })
          break
        case 'circle': // Support pour `Circle`
        case 'Circle':
          fabricObject = new fabric.Circle({
            ...rest
          })
          break
        case 'triangle': // Support pour `Triangle`
        case 'Triangle':
          fabricObject = new fabric.Triangle({
            ...rest
          })
          break
        default:
          console.warn(`Type d'objet inconnu : ${type}`)
          return
      }

      canvas.add(fabricObject)
    })

    // Sauvegarde et synchronisation lors de la modification
    const handleObjectModified = () => {
      const canvas = canvasInstance.current
      if (!canvas) return

      const updatedContent = canvas.getObjects().map((obj) => {
        const commonProperties = {
          id: obj.id || Math.random().toString(36).substr(2, 9),
          type: obj.type?.toLowerCase() || 'unknown', // Normalise le type en minuscule
          left: obj.left,
          top: obj.top,
          fill: obj.fill,
          angle: obj.angle,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY
        }

        if (obj.type === 'i-text') {
          return {
            ...commonProperties,
            type: 'i-text',
            text: obj.text,
            fontSize: obj.fontSize
          }
        } else if (obj.type === 'rect' || obj.type === 'triangle') {
          return {
            ...commonProperties,
            width: obj.width,
            height: obj.height
          }
        } else if (obj.type === 'circle') {
          return {
            ...commonProperties,
            radius: obj.radius
          }
        }

        console.warn(`Type d'objet inconnu lors de la modification : ${obj.type}`)
        return commonProperties
      })

      dispatch({
        type: 'UPDATE_CELL_CONTENT',
        payload: { id: cellId, content: updatedContent }
      })

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
        editable: true,
        id: Math.random().toString(36).substr(2, 9) // Génère un ID unique pour l'objet
      })
      canvas.add(iText)
      canvas.setActiveObject(iText)

      // Sauvegarde immédiate après ajout
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

  const addNewShape = (shapeType) => {
    const canvas = canvasInstance.current
    if (canvas) {
      let shape

      // Créer une forme basée sur le type sélectionné
      switch (shapeType) {
        case 'rectangle':
          shape = new fabric.Rect({
            left: 10,
            top: 10,
            fill: '#00f',
            width: 50,
            height: 50
          })
          break
        case 'circle':
          shape = new fabric.Circle({
            left: 10,
            top: 10,
            fill: '#f00',
            radius: 25
          })
          break
        case 'triangle':
          shape = new fabric.Triangle({
            left: 10,
            top: 10,
            fill: '#0f0',
            width: 50,
            height: 50
          })
          break
        default:
          return
      }

      // Ajouter la forme au canvas
      canvas.add(shape)
      canvas.setActiveObject(shape)

      // Sauvegarder immédiatement l'état du canvas
      const updatedContent = canvas.getObjects().map((obj) => ({
        id: obj.id || Math.random().toString(36).substr(2, 9), // Générer un ID unique
        type: obj.type === 'i-text' ? 'IText' : obj.type,
        ...obj.toObject([
          'left',
          'top',
          'fill',
          'width',
          'height',
          'radius',
          'scaleX',
          'scaleY',
          'angle',
          'stroke',
          'strokeWidth'
        ])
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
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
        <button
          onClick={addNewIText}
          style={{
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
        <button
          onClick={() => addNewShape('rectangle')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Ajouter un Rectangle
        </button>
        <button
          onClick={() => addNewShape('circle')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ffc107',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Ajouter un Cercle
        </button>
        <button
          onClick={() => addNewShape('triangle')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Ajouter un Triangle
        </button>
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
