import React, { useContext, useState } from 'react'
import { GridContext } from '../../context/GridContext'
import CSVImporter from './CSVImporter'

const validateConfigValue = (key, value, config) => {
  const { pageWidth, pageHeight } = config

  if (['offsetTop', 'offsetLeft', 'spacingHorizontal', 'spacingVertical'].includes(key)) {
    if (value < 0) return 'La valeur doit être supérieure ou égale à 0.'
  } else if (value <= 0) {
    return 'La valeur doit être supérieure à 0.'
  }

  if (
    (key === 'offsetTop' && value >= pageHeight) ||
    (key === 'offsetLeft' && value >= pageWidth)
  ) {
    return 'La valeur dépasse les dimensions de la page.'
  }

  return null
}

const ConfigInput = ({ id, label, value, error, onChange, max }) => (
  <div>
    <label htmlFor={id} className="block text-gray-600 dark:text-gray-300">
      {label}
    </label>
    <input
      type="number"
      id={id}
      className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring focus:ring-blue-300 dark:bg-dark-background dark:text-dark-text"
      value={value}
      onChange={onChange}
      step="0.1"
      min="0"
      max={max}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
)

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
      // Utilisez directement le recalculatePages dans le dispatch
      dispatch({
        type: 'UPDATE_CONFIG',
        payload: {
          config: { [id]: numericValue },
          // Ajoutez cette ligne pour forcer la mise à jour de la grille
          regenerateGrid: true
        }
      })
    }
  }

  return (
    <div className="rounded bg-white p-4 shadow dark:bg-gray-800">
      <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">Configuration</h4>
      {Object.keys(errors).length > 0 && (
        <p className="mb-4 font-medium text-red-500">Veuillez corriger les erreurs.</p>
      )}
      <form className="mb-6 grid grid-cols-2 gap-4">
        {inputs.map((input) => (
          <ConfigInput
            key={input.id}
            id={input.id}
            label={input.label}
            value={input.value}
            error={errors[input.id]}
            onChange={handleChange}
            max={
              input.id === 'cellWidth'
                ? config.pageWidth
                : input.id === 'cellHeight'
                  ? config.pageHeight
                  : undefined
            }
          />
        ))}
      </form>
    </div>
  )
}

export default GridConfigurator
