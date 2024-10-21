import React from 'react'
import { faTextHeight } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../ui/IconButton'

export default function TextMenu({ onAddText }) {
  return (
    <div className="flex space-x-2 rounded bg-white shadow-lg">
      <IconButton
        onClick={onAddText}
        icon={faTextHeight}
        title="Ajouter du texte"
        className="flex size-12 items-center justify-center rounded bg-blue-500 text-white hover:bg-blue-600"
      />
    </div>
  )
}
