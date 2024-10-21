import React from 'react'
import { faCircle, faSquare } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../ui/IconButton'

export default function ShapeMenu({ onAddCircle, onAddRectangle }) {
  return (
    <div className="flex space-x-2 rounded bg-white shadow-lg">
      <IconButton
        onClick={onAddCircle}
        icon={faCircle}
        title="Ajouter un cercle"
        className="flex size-12 items-center justify-center rounded bg-blue-500 text-white hover:bg-blue-600"
      />
      <IconButton
        onClick={onAddRectangle}
        icon={faSquare}
        title="Ajouter un rectangle"
        className="flex size-12 items-center justify-center rounded bg-blue-500 text-white hover:bg-blue-600"
      />
    </div>
  )
}
