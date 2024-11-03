import React, { useState } from 'react'
import IconButton from '../../ui/IconButton'
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
import { useCellManagerContext } from '../../../context/CellManagerContext' // Utiliser le contexte

const ImportMenu = () => {
  const { importData } = useCellManagerContext() // Utiliser le contexte partagé
  const [file, setFile] = useState(null)

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0]
    setFile(uploadedFile)
  }

  const handleProcessCSV = () => {
    if (!file) {
      console.error('Aucun fichier sélectionné')
      return
    }
    importData(file) // Appeler importData pour traiter le fichier CSV
  }

  return (
    <div className="relative flex w-auto space-x-2 rounded bg-white p-2 shadow-lg">
      <input type="file" accept=".csv" onChange={handleFileUpload} className="mb-2" />
      <IconButton
        onClick={handleProcessCSV}
        icon={faFileCsv}
        title="Importer CSV"
        className="bg-green-500 text-white hover:bg-green-600"
        size="w-9 h-12"
        iconSize="text-xl"
      />
    </div>
  )
}

export default ImportMenu
