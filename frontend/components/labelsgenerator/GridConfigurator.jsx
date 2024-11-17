import React, { useContext, useState, useEffect } from 'react'
import { GridContext } from '../../context/GridContext'
import CSVImporter from './CSVImporter' // Import du composant CSVImporter

const GridConfigurator = () => {
  const { state, dispatch } = useContext(GridContext)
  const { config, selectedCellId, cellContents } = state

  const [errors, setErrors] = useState({})
  const [content, setContent] = useState('')

  // Charger le contenu de la cellule sélectionnée dans le formulaire
  useEffect(() => {
    if (selectedCellId) {
      setContent(cellContents[selectedCellId] || '') // Récupérer le contenu existant ou vide
    }
  }, [selectedCellId, cellContents])

  const validateConfig = (key, value) => {
    const { pageWidth, pageHeight } = config
    const newErrors = { ...errors }

    switch (key) {
      case 'cellWidth':
      case 'cellHeight':
        if (value <= 0) {
          newErrors[key] = 'La taille doit être supérieure à 0 mm.'
        } else {
          delete newErrors[key]
        }
        break

      case 'offsetTop':
      case 'offsetLeft':
        if (value < 0) {
          newErrors[key] = 'L’offset ne peut pas être négatif.'
        } else if (
          (key === 'offsetTop' && value >= pageHeight) ||
          (key === 'offsetLeft' && value >= pageWidth)
        ) {
          newErrors[key] = 'L’offset ne peut pas dépasser les dimensions de la page.'
        } else {
          delete newErrors[key]
        }
        break

      default:
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { id, value } = e.target
    const numericValue = parseFloat(value)

    if (validateConfig(id, numericValue)) {
      dispatch({
        type: 'UPDATE_CONFIG',
        payload: { [id]: numericValue }
      })
      dispatch({ type: 'GENERATE_GRID' })
    }
  }

  const handleContentChange = (e) => {
    setContent(e.target.value)
  }

  const saveContent = () => {
    if (selectedCellId) {
      dispatch({
        type: 'UPDATE_CELL_CONTENT',
        payload: { id: selectedCellId, content }
      })
    }
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <div>
      <h4>Configuration</h4>
      {hasErrors && (
        <p style={{ color: 'red', fontWeight: 'bold' }}>
          Veuillez corriger les erreurs pour générer la grille correctement.
        </p>
      )}
      <form style={{ display: 'grid', gap: '10px' }}>
        {Object.keys(config).map((key) => (
          <div key={key}>
            <label>
              {key.replace(/([A-Z])/g, ' $1')} (mm):
              <input
                type="number"
                id={key}
                value={config[key]}
                onChange={handleChange}
                step="0.1"
              />
            </label>
            {errors[key] && <p style={{ color: 'red', fontSize: '12px' }}>{errors[key]}</p>}
          </div>
        ))}
      </form>

      {/* Composant CSVImporter pour importer les données CSV */}
      <div style={{ marginTop: '20px' }}>
        <CSVImporter />
      </div>

      {/* Formulaire d'édition de contenu */}
      {selectedCellId && (
        <div style={{ marginTop: '20px' }}>
          <h4>Modifier le contenu</h4>
          <textarea
            value={content}
            onChange={handleContentChange}
            rows="4"
            style={{ width: '100%', resize: 'none' }}
          />
          <button onClick={saveContent} style={{ marginTop: '10px', padding: '5px 10px' }}>
            Sauvegarder
          </button>
        </div>
      )}
    </div>
  )
}

export default GridConfigurator
