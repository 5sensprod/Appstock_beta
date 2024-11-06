import React, { useState } from 'react'
import IconButton from '../../ui/IconButton'
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
import { useCellManagerContext } from '../../../context/CellManagerContext'

const ImportMenu = () => {
  const { importData } = useCellManagerContext()
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0]
    if (uploadedFile) {
      setFile(uploadedFile)
      setError(null) // Réinitialise l'erreur lors d'une nouvelle sélection de fichier
    }
  }

  const handleProcessCSV = () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier.')
      return
    }
    importData(file) // Appeler importData pour traiter le fichier CSV
    setFile(null) // Réinitialiser le fichier après importation
  }

  return (
    <div className="relative flex w-auto flex-col space-y-2 rounded bg-white p-2 shadow-lg">
      <input type="file" accept=".csv" onChange={handleFileUpload} className="mb-2" />
      <IconButton
        onClick={handleProcessCSV}
        icon={faFileCsv}
        title="Importer CSV"
        className="bg-green-500 text-white hover:bg-green-600"
        size="w-9 h-12"
        iconSize="text-xl"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default ImportMenu
