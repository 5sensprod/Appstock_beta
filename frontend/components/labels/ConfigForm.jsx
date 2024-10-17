import React from 'react'
import { useCanvas } from '../../context/CanvasContext' // Import du contexte Canvas

const ConfigForm = () => {
  const { labelConfig, updateCanvasSize, setLabelConfig } = useCanvas()

  const handleInputChange = (e) => {
    const { id, value } = e.target
    const newValue = parseFloat(value)

    // Mise à jour de la taille dans le contexte, en millimètres
    if (id === 'labelWidth' || id === 'labelHeight') {
      updateCanvasSize({ [id]: newValue })
    } else {
      setLabelConfig((prevConfig) => ({
        ...prevConfig,
        [id]: newValue
      }))
    }
  }

  const inputs = [
    { id: 'labelWidth', label: 'Largeur (mm)', value: labelConfig.labelWidth },
    { id: 'labelHeight', label: 'Hauteur (mm)', value: labelConfig.labelHeight },
    { id: 'offsetTop', label: 'Offset Haut (mm)', value: labelConfig.offsetTop },
    { id: 'offsetLeft', label: 'Offset Gauche (mm)', value: labelConfig.offsetLeft },
    {
      id: 'spacingVertical',
      label: 'Espacement Vertical (mm)',
      value: labelConfig.spacingVertical
    },
    {
      id: 'spacingHorizontal',
      label: 'Espacement Horizontal (mm)',
      value: labelConfig.spacingHorizontal
    }
  ]

  return (
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
            onChange={handleInputChange}
            step="0.1"
            min="0"
            max={input.id === 'labelWidth' ? 210 : input.id === 'labelHeight' ? 297 : undefined}
          />
        </div>
      ))}
    </form>
  )
}

export default ConfigForm
