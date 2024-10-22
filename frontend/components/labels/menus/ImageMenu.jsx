import React from 'react'
import { faImage } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../ui/IconButton'

export default function ImageMenu({ onAddImage }) {
  const handleFileChange = (event) => {
    const file = event.target.files[0] // Récupérer le premier fichier sélectionné
    if (file) {
      onAddImage(file) // Appeler la méthode pour ajouter l'image au canevas
    }
  }

  return (
    <div className="relative flex space-x-2 rounded bg-white p-2 shadow-lg">
      {/* Champ de fichier pour uploader une image */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange} // Lorsque le fichier est sélectionné
        className="w-64 rounded border p-2"
      />
      <IconButton
        icon={faImage}
        title="Ajouter une image"
        className="flex size-12 items-center justify-center rounded bg-green-500 text-white hover:bg-green-600"
      />
    </div>
  )
}
