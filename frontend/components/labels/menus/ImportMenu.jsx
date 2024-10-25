import React, { useState } from 'react'
import { useInstance } from '../../../context/InstanceContext'
import IconButton from '../../ui/IconButton'
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'

const ImportMenu = () => {
  const { importData } = useInstance()
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
    <div className="relative flex items-center space-x-2">
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
