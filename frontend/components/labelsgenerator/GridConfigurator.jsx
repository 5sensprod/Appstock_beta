import React, { useContext, useState } from 'react'
import { GridContext } from '../../context/GridContext'
import CSVImporter from './CSVImporter' // Import du composant CSVImporter

const validateConfigValue = (key, value, config) => {
  const { pageWidth, pageHeight } = config

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

  const inputs = [
    { id: 'cellWidth', label: 'Largeur Cellule (mm)', value: config.cellWidth },
    { id: 'cellHeight', label: 'Hauteur Cellule (mm)', value: config.cellHeight },
    { id: 'offsetTop', label: 'Offset Haut (mm)', value: config.offsetTop },
    { id: 'offsetLeft', label: 'Offset Gauche (mm)', value: config.offsetLeft },
    { id: 'spacingVertical', label: 'Espacement Vertical (mm)', value: config.spacingVertical },
    {
      id: 'spacingHorizontal',
      label: 'Espacement Horizontal (mm)',
      value: config.spacingHorizontal
    }
  ]

  const handleChange = (e) => {
    const { id, value } = e.target
    const numericValue = parseFloat(value)

    const error = validateConfigValue(id, numericValue, config)

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors }
      if (error) {
        newErrors[id] = error
      } else {
        delete newErrors[id]
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
      <form className="mb-6 grid grid-cols-2 gap-4">
        {inputs.map((input) => (
          <div key={input.id}>
            <label htmlFor={input.id} className="block text-gray-600 dark:text-gray-300">
              {input.label}
            </label>
            <input
              type="number"
              id={input.id}
              className="w-full rounded border border-gray-300 p-2 dark:bg-dark-background dark:text-dark-text"
              value={input.value}
              onChange={handleChange}
              step="0.1"
              min="0"
              max={
                input.id === 'cellWidth'
                  ? config.pageWidth
                  : input.id === 'cellHeight'
                    ? config.pageHeight
                    : undefined
              }
            />
            {errors[input.id] && (
              <p style={{ color: 'red', fontSize: '12px' }}>{errors[input.id]}</p>
            )}
          </div>
        ))}
      </form>
      <CSVImporter />
    </div>
  )
}

export default GridConfigurator
