import { useReducer, useCallback } from 'react'
import { cellReducer, initialState } from '../reducers/cellReducer'
import * as fabric from 'fabric'

const useCellManager = () => {
  const [state, dispatch] = useReducer(cellReducer, initialState)

  // Importation de données CSV et mise à jour de l'état
  const importData = useCallback((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const rows = text.split('\n').filter((row) => row.trim())
      const cells = rows.slice(1).map((row) => {
        const [name = '', price = '0', gencode = ''] = row.split(',').map((val) => val.trim())
        return { name: name || 'Unnamed', price: price || '0', gencode: gencode || 'No Code' }
      })
      console.log('Données importées depuis CSV:', cells)
      dispatch({ type: 'IMPORT_DATA', payload: cells })
    }
    reader.onerror = (error) => console.error('Error reading file:', error)
    reader.readAsText(file)
  }, [])

  // Mise à jour du style global (couleur de fond, taille de police, etc.)
  const updateStyle = (property, value) => {
    dispatch({ type: 'UPDATE_STYLE', payload: { [property]: value } })
  }

  // Mise à jour de la couleur d'un type d'objet (nom, prix, gencode)
  const updateObjectColor = (objectType, color) => {
    dispatch({ type: 'UPDATE_OBJECT_COLOR', payload: { objectType, color } })
  }

  // Synchronisation des propriétés de chaque objet avec l'état global
  const syncObjectProperties = (objectType, properties) => {
    dispatch({
      type: 'UPDATE_OBJECT_PROPERTIES',
      payload: {
        objectType,
        ...properties
      }
    })
  }

  // Fonction pour rendre chaque cellule en utilisant les propriétés globales
  const renderCell = (data, canvasRef) => {
    if (!canvasRef) return

    // Initialisation du canvas Fabric.js
    const canvas = new fabric.Canvas(canvasRef)
    canvas.setDimensions({ width: 180, height: 100 })

    // Fonction pour créer chaque objet texte (nom, prix, gencode)
    const createTextObject = (text, objectType) => {
      const objProperties = state.objectProperties[objectType] // Récupération des propriétés globales de l'objet

      const obj = new fabric.IText(text, {
        ...objProperties,
        fontSize: parseInt(state.style.fontSize),
        fill: state.objectColors[objectType]
      })

      // Écouteur de déplacement pour mettre à jour les propriétés globales
      obj.on('moved', () => {
        syncObjectProperties(objectType, {
          left: obj.left,
          top: obj.top,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle
        })
      })

      obj.on('scaled', () => {
        syncObjectProperties(objectType, {
          scaleX: obj.scaleX,
          scaleY: obj.scaleY
        })
      })

      obj.on('rotated', () => {
        syncObjectProperties(objectType, {
          angle: obj.angle
        })
      })

      return obj
    }

    // Création des objets texte pour chaque donnée
    const nameText = createTextObject(data.name, 'name')
    const priceText = createTextObject(`${data.price}€`, 'price')
    const gencodeText = createTextObject(data.gencode, 'gencode')

    // Ajout des objets au canvas
    canvas.add(nameText, priceText, gencodeText)
    canvas.renderAll()
  }

  return {
    state,
    dispatch,
    importData,
    updateStyle,
    updateObjectColor,
    renderCell
  }
}

export default useCellManager
