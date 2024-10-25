import React, { useState } from 'react'
import { useCanvas } from '../../../context/CanvasContext'
import IconButton from '../../ui/IconButton'
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
import Papa from 'papaparse' // Utiliser Papaparse pour parser les fichiers CSV

const ImportMenu = () => {
  const { onAddTextCsv, onAddQrCode } = useCanvas()
  const [file, setFile] = useState(null)

  // Fonction pour gérer le téléchargement du fichier CSV
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0]
    setFile(uploadedFile)
  }

  // Fonction pour traiter le CSV
  const handleProcessCSV = () => {
    if (!file) {
      console.error('Aucun fichier sélectionné')
      return
    }

    // Utiliser Papaparse pour parser le fichier CSV
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        results.data.forEach((row) => {
          const { Nom, Tarif, Gencode } = row

          // Ajouter le nom du produit au canevas
          if (Nom) {
            onAddTextCsv(Nom)
          }

          // Ajouter le tarif du produit au canevas
          if (Tarif) {
            onAddTextCsv(`${Tarif}€`)
          }

          // Ajouter le QR code pour le gencode
          if (Gencode) {
            onAddQrCode(Gencode)
          }
        })
      },
      error: (error) => {
        console.error("Erreur lors de l'importation du fichier CSV", error)
      }
    })
  }

  return (
    <div className="relative flex items-center space-x-2">
      {/* Input pour télécharger le fichier CSV */}
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
