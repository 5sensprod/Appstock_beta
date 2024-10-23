import React, { useEffect, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEyeDropper } from '@fortawesome/free-solid-svg-icons' // Icône de pipette de FontAwesome

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
      console.log('Résultat complet capturé par EyeDropper:', result)

      if (result && result.sRGBHex) {
        console.log('Couleur capturée par EyeDropper:', result.sRGBHex)
        setSelectedColor(result.sRGBHex)
      } else {
        console.log('Aucune couleur capturée')
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de couleur :', error)
    }
  }

  return (
    <div className="textTool mb-2">
      <HexColorPicker color={color} onChange={(newColor) => setSelectedColor(newColor)} />

      {isEyeDropperSupported && (
        <button
          onClick={handleEyeDropper}
          className="mt-2 flex items-center justify-center rounded bg-gray-200 p-2 text-black hover:bg-gray-300"
          title="Utiliser la pipette"
        >
          <FontAwesomeIcon icon={faEyeDropper} className="text-xl" />
        </button>
      )}
    </div>
  )
}

export default ColorPicker
