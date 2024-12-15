import React from 'react'
import { faTextHeight } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../ui/IconButton'
import { useTextManager } from '../../../hooks/useTextManager'

export default function TextMenu({ onAddText }) {
  const { currentFont, handleFontChange } = useTextManager()

  return (
    <div className="relative flex w-auto space-x-2 rounded bg-white p-1 shadow-lg">
      <IconButton
        onClick={onAddText}
        icon={faTextHeight}
        title="Ajouter du texte"
        className="bg-blue-500 hover:bg-blue-600"
        size="w-9 h-9"
        iconSize="text-xl"
      />
      <select
        value={currentFont}
        onChange={(e) => handleFontChange(e.target.value)}
        className="rounded border bg-white p-2 shadow"
      >
        {[
          'Lato',
          'Merriweather',
          'Nunito',
          'Open Sans',
          'Pacifico',
          'Playfair Display',
          'Roboto'
        ].map((font) => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
      </select>
    </div>
  )
}
