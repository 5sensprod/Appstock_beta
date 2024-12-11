// components/texttool/ColorPicker.jsx
import React, { useEffect, useState, useCallback } from 'react'
import { HexColorPicker } from 'react-colorful'
import { faEyeDropper } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../ui/IconButton'

const ColorPicker = ({ color, setSelectedColor }) => {
  const [isEyeDropperSupported, setIsEyeDropperSupported] = useState(false)
  const [internalColor, setInternalColor] = useState(color)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.EyeDropper) {
      setIsEyeDropperSupported(true)
    }
  }, [])

  // Synchroniser la couleur interne quand la prop change
  useEffect(() => {
    const hexColor = rgbaToHex(color)
    setInternalColor(hexColor)
  }, [color])

  // Convertir RGBA en HEX
  const rgbaToHex = useCallback((color) => {
    if (color.startsWith('rgba')) {
      const values = color.match(/\d+/g)
      if (values && values.length >= 3) {
        const [r, g, b] = values
        return rgbToHex(parseInt(r), parseInt(g), parseInt(b))
      }
    }
    if (color.startsWith('rgb')) {
      const values = color.match(/\d+/g)
      if (values && values.length >= 3) {
        const [r, g, b] = values
        return rgbToHex(parseInt(r), parseInt(g), parseInt(b))
      }
    }
    return color
  }, [])

  // RGB vers HEX
  const rgbToHex = useCallback((r, g, b) => {
    const toHex = (n) => {
      const hex = n.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }, [])

  // Validation du format hexadécimal
  const getValidHexColor = useCallback((hexColor) => {
    const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(hexColor)
    return isValidHex ? hexColor : '#000000'
  }, [])

  const handleColorChange = useCallback(
    (newColor) => {
      const validColor = getValidHexColor(newColor)
      setInternalColor(validColor)
      setSelectedColor(validColor)
    },
    [setSelectedColor, getValidHexColor]
  )

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
