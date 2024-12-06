//frontend\components\labelsgenerator\texttool\ColorPicker.jsx

import React, { useEffect, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { faEyeDropper } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../ui/IconButton'

const ColorPicker = ({ color, setSelectedColor }) => {
  const [isEyeDropperSupported, setIsEyeDropperSupported] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.EyeDropper) {
      setIsEyeDropperSupported(true)
    }
  }, [])

  // Fonction utilitaire pour valider et fixer les valeurs hexadécimales
  const getValidHexColor = (hexColor) => {
    // Vérifie que le format est bien en hexadécimal, sinon retourne la couleur par défaut
    const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(hexColor)
    return isValidHex ? hexColor : '#000000'
  }

  const handleColorChange = (newColor) => {
    const validColor = getValidHexColor(newColor)
    setSelectedColor(validColor)
  }

  const handleEyeDropper = async () => {
    if (!isEyeDropperSupported) {
      alert('Votre navigateur ne supporte pas la pipette.')
      return
    }

    try {
      const eyeDropper = new window.EyeDropper()
      const result = await eyeDropper.open()
      if (result && result.sRGBHex) {
        setSelectedColor(getValidHexColor(result.sRGBHex))
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de couleur :', error)
    }
  }

  return (
    <div className="textTool mb-2">
      <HexColorPicker color={color} onChange={handleColorChange} />

      {isEyeDropperSupported && (
        <IconButton
          onClick={handleEyeDropper}
          icon={faEyeDropper}
          title="Utiliser la pipette"
          className="mt-2 bg-blue-500 hover:bg-blue-600"
          size="w-10 h-10"
          iconSize="text-xl"
        />
      )}
    </div>
  )
}

export default ColorPicker
