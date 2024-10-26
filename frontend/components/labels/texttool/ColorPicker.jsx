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

  const handleEyeDropper = async () => {
    if (!isEyeDropperSupported) {
      alert('Votre navigateur ne supporte pas la pipette.')
      return
    }

    try {
      const eyeDropper = new window.EyeDropper()
      const result = await eyeDropper.open()
      if (result && result.sRGBHex) {
        setSelectedColor(result.sRGBHex)
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de couleur :', error)
    }
  }

  return (
    <div className="textTool mb-2">
      <HexColorPicker color={color} onChange={(newColor) => setSelectedColor(newColor)} />

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
