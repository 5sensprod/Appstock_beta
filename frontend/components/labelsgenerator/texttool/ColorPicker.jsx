// frontend/components/labelsgenerator/texttool/ColorPicker.jsx
import React, { useEffect, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { faEyeDropper } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../ui/IconButton'
import { rgbToHex, getValidHexColor } from '../../../utils/conversionUtils'

const ColorPicker = ({ color, setSelectedColor }) => {
  const [isEyeDropperSupported, setIsEyeDropperSupported] = useState(false)
  const [internalColor, setInternalColor] = useState(rgbToHex(color))

  useEffect(() => {
    if (typeof window !== 'undefined' && window.EyeDropper) {
      setIsEyeDropperSupported(true)
    }
  }, [])

  useEffect(() => {
    setInternalColor(rgbToHex(color))
  }, [color])

  const handleColorChange = (newColor) => {
    const validColor = getValidHexColor(newColor)
    setInternalColor(validColor)
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
        const validColor = getValidHexColor(result.sRGBHex)
        setInternalColor(validColor)
        setSelectedColor(validColor)
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de couleur :', error)
    }
  }

  return (
    <div className="textTool mb-2">
      <HexColorPicker color={internalColor} onChange={handleColorChange} />
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
