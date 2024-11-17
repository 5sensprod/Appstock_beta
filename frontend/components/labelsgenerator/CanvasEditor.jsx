import React, { useEffect, useRef, useContext } from 'react'
import * as fabric from 'fabric'
import { CanvasContext } from '../../context/CanvasContext'

const CanvasEditor = () => {
  const canvasRef = useRef(null)
  const { state, dispatch } = useContext(CanvasContext)
  const { canvas } = state

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 400,
      height: 250,
      backgroundColor: '#fff',
      selection: true
    })

    // Sauvegarder l'instance du canvas dans le contexte
    dispatch({ type: 'SET_CANVAS', payload: fabricCanvas })

    return () => {
      fabricCanvas.dispose() // Nettoyage à la suppression du composant
    }
  }, [dispatch])

  // Fonction pour ajouter un IText au canvas
  const addIText = () => {
    if (canvas) {
      const itext = new fabric.IText('Gencode: 123456789012', {
        left: 50,
        top: 50,
        fontSize: 16,
        fill: '#000',
        fontFamily: 'Arial'
      })

      canvas.add(itext) // Ajouter l'objet IText au canvas
      canvas.setActiveObject(itext) // Sélectionner l'objet ajouté
      canvas.renderAll() // Rendre le canvas avec le nouvel objet
    }
  }

  // Fonction pour sauvegarder les objets actuels du canvas dans le contexte
  const saveObjects = () => {
    if (canvas) {
      const objects = canvas.getObjects().map((obj) => obj.toObject())
      dispatch({ type: 'UPDATE_OBJECTS', payload: objects })
      alert('Contenu sauvegardé !')
    }
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: '10px' }}>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={addIText} style={{ padding: '5px 10px', marginRight: '10px' }}>
          Ajouter Gencode (IText)
        </button>
        <button onClick={saveObjects} style={{ padding: '5px 10px', marginRight: '10px' }}>
          Sauvegarder
        </button>
      </div>
      <canvas ref={canvasRef} />
    </div>
  )
}

export default CanvasEditor
