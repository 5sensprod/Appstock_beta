import React, { useState, useEffect, useRef } from 'react'
import { faCircle, faSquare } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../ui/IconButton'
import { useCanvas } from '../../../context/CanvasContext'

export default function ShapeMenu({ onAddCircle, onAddRectangle }) {
  const [, setIsColorPickerOpen] = useState(false)
  const pickerRef = useRef(null)
  const hasModifications = useRef(false)

  const { canvas } = useCanvas()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsColorPickerOpen(false)
        if (hasModifications.current) {
          setTimeout(() => {
            canvas?.fire('object:modified')
            canvas?.renderAll()
          }, 0)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [canvas])

  return (
    <div className="relative flex w-auto space-x-2 rounded bg-white p-2 shadow-lg">
      <IconButton
        onClick={onAddCircle}
        icon={faCircle}
        title="Ajouter un cercle"
        className="bg-blue-500 hover:bg-blue-600"
        size="w-12 h-12"
        iconSize="text-xl"
      />
      <IconButton
        onClick={onAddRectangle}
        icon={faSquare}
        title="Ajouter un rectangle"
        className="bg-blue-500 hover:bg-blue-600"
        size="w-12 h-12"
        iconSize="text-xl"
      />
    </div>
  )
}
