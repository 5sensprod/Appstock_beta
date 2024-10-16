import React from 'react'

const ColorPicker = ({ color, setTextStyle }) => {
  return (
    <div className="textTool mb-2">
      <input
        type="color"
        value={color} // La couleur actuelle de l'objet sélectionné
        onChange={(e) =>
          setTextStyle(e.target.value)
        } // Mettre à jour la couleur
      />
    </div>
  )
}

export default ColorPicker
