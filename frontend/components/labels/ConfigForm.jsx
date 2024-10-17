// frontend/components/labels/ConfigForm.jsx
import React from 'react';

const ConfigForm = ({ labelConfig, setLabelConfig }) => {
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setLabelConfig((prevConfig) => ({
      ...prevConfig,
      [id]: parseFloat(value)
    }));
  };

  const inputs = [
    { id: 'labelWidth', label: 'Largeur (mm)' },
    { id: 'labelHeight', label: 'Hauteur (mm)' },
    { id: 'offsetTop', label: 'Offset Haut (mm)' },
    { id: 'offsetLeft', label: 'Offset Gauche (mm)' },
    { id: 'spacingVertical', label: 'Espacement Vertical (mm)' },
    { id: 'spacingHorizontal', label: 'Espacement Horizontal (mm)' }
  ];

  return (
    <form className="mb-6 grid grid-cols-2 gap-4">
      {inputs.map((input) => (
        <div key={input.id}>
          <label
            htmlFor={input.id}
            className="block text-gray-600 dark:text-gray-300"
          >
            {input.label}
          </label>
          <input
            type="number"
            id={input.id}
            className="w-full rounded border border-gray-300 p-2 dark:bg-dark-background dark:text-dark-text"
            value={labelConfig[input.id]}
            onChange={handleInputChange}
            step="0.1"
          />
        </div>
      ))}
    </form>
  );
};

export default ConfigForm;