import React from 'react'
import Papa from 'papaparse' // Utilisation de la bibliothèque PapaParse pour lire les CSV
import { useContext } from 'react'
import { GridContext } from '../../context/GridContext'

const CSVImporter = () => {
  const { state, dispatch } = useContext(GridContext) // Récupération de state et dispatch

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data

          // Vérifier si le fichier dépasse le nombre de cellules disponibles
          if (rows.length > state.grid.length) {
            alert(
              `Attention : Votre fichier CSV contient ${rows.length} lignes, mais la grille actuelle ne peut afficher que ${state.grid.length} cellules.`
            )
          }

          dispatch({ type: 'IMPORT_CSV', payload: rows })
        },
        error: (error) => {
          console.error('Erreur lors de l’importation CSV :', error)
        }
      })
    }
  }

  return (
    <div>
      <h4>Importer un fichier CSV</h4>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
    </div>
  )
}

export default CSVImporter
