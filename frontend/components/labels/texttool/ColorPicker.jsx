import React, { useEffect, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { faEyeDropper } from '@fortawesome/free-solid-svg-icons' // Icône pipette de FontAwesome
import IconButton from '../../ui/IconButton' // Importer IconButton

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
      {/* Composant HexColorPicker */}
      <HexColorPicker color={color} onChange={(newColor) => setSelectedColor(newColor)} />

      {/* Bouton pipette avec IconButton */}
      {isEyeDropperSupported && (
        <IconButton
          onClick={handleEyeDropper}
          icon={faEyeDropper}
          title="Utiliser la pipette"
          className="mt-2 bg-blue-500 hover:bg-blue-600" // Couleurs et marges personnalisées
          size="w-10 h-10" // Taille du bouton
          iconSize="text-xl" // Taille de l'icône
        />
      )}
    </div>
  )
}

export default ColorPicker
