import React, { useEffect, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import IconButton from '../../ui/IconButton'
import { faEyeDropper } from '@fortawesome/free-solid-svg-icons' // Importer l'icône pipette de FontAwesome

const ColorPicker = ({ color, setTextStyle }) => {
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
      console.log('Résultat complet capturé par EyeDropper:', result) // Affiche tout le résultat

      if (result && result.sRGBHex) {
        console.log('Couleur capturée par EyeDropper:', result.sRGBHex) // Affiche la couleur capturée
        setTextStyle(result.sRGBHex) // Transmet la couleur capturée via la pipette
      } else {
        console.log('Aucune couleur capturée')
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de couleur :', error)
    }
  }

  return (
    <div className="textTool mb-2">
      <HexColorPicker
        color={color}
        onChange={(newColor) => setTextStyle(newColor)} // Transmet la couleur sélectionnée
      />

      {isEyeDropperSupported && (
        <IconButton
          onClick={handleEyeDropper}
          icon={faEyeDropper} // Icône de pipette
          title="Utiliser la pipette"
          className="ml-2 mt-2 bg-gray-200"
          size="w-10 h-10" // Taille personnalisée du bouton
        />
      )}
    </div>
  )
}

export default ColorPicker
