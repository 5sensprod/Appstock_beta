import React, { useContext, useState } from 'react'
import { GridContext } from '../../context/GridContext'
import CSVImporter from './CSVImporter' // Import du composant CSVImporter

const validateConfigValue = (key, value, config) => {
  const { pageWidth, pageHeight } = config

  // Autoriser 0 pour certaines clés spécifiques
  if (['offsetTop', 'offsetLeft', 'spacingHorizontal', 'spacingVertical'].includes(key)) {
    if (value < 0) return 'La valeur doit être supérieure ou égale à 0.'
  } else {
    if (value <= 0) return 'La valeur doit être supérieure à 0.'
  }

  if (
    (key === 'offsetTop' && value >= pageHeight) ||
    (key === 'offsetLeft' && value >= pageWidth)
  ) {
    return 'La valeur dépasse les dimensions de la page.'
  }

  return null
}

const GridConfigurator = () => {
  const { state, dispatch } = useContext(GridContext)
  const { config } = state
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { id, value } = e.target
    const numericValue = parseFloat(value)

    const error = validateConfigValue(id, numericValue, config)

    // Mettre à jour uniquement les erreurs pour les champs invalides
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors }
      if (error) {
        newErrors[id] = error // Ajouter une erreur si elle existe
      } else {
        delete newErrors[id] // Supprimer l'erreur si corrigée
      }
      return newErrors
    })

    if (!error) {
      dispatch({ type: 'UPDATE_CONFIG', payload: { [id]: numericValue } })
      dispatch({ type: 'GENERATE_GRID' })
    }
  }

  return (
    <div>
      <h4>Configuration</h4>
      {Object.keys(errors).length > 0 && (
        <p style={{ color: 'red', fontWeight: 'bold' }}>Veuillez corriger les erreurs.</p>
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
      <CSVImporter />
    </div>
  )
}

export default GridConfigurator
