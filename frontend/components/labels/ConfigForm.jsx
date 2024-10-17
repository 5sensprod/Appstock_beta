import React from 'react'
import { useCanvas } from '../../context/CanvasContext' // Import du contexte Canvas

const ConfigForm = () => {
  const { canvasSize, updateCanvasSize, labelConfig, setLabelConfig } = useCanvas()

  const handleInputChange = (e) => {
    const { id, value } = e.target
    const newValue = parseFloat(value)

    if (id === 'labelWidth') {
      updateCanvasSize({ width: newValue })
    } else if (id === 'labelHeight') {
      updateCanvasSize({ height: newValue })
    } else {
      // Mise à jour des autres propriétés de configuration
      setLabelConfig((prevConfig) => ({
        ...prevConfig,
        [id]: newValue
      }))
    }
  }

  const inputs = [
    { id: 'labelWidth', label: 'Largeur (mm)', value: canvasSize.width },
    { id: 'labelHeight', label: 'Hauteur (mm)', value: canvasSize.height },
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
          />
        </div>
      ))}
    </form>
  )
}

export default ConfigForm
