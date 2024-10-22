import React from 'react'

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
    </div>
  )
}
