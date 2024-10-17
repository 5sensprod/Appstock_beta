import React from 'react'
import { HexColorPicker } from 'react-colorful'

const ColorPicker = ({ color, setTextStyle }) => {
  return (
    <div className="textTool mb-2">
      <HexColorPicker
        color={color} // La couleur actuelle de l'objet sélectionné
        onChange={(newColor) =>
          setTextStyle(newColor)
        } // Mettre à jour la couleur
      />
    </div>
  )
}

export default ColorPicker
