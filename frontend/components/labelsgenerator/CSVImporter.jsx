import React, { useContext } from 'react'
import Papa from 'papaparse' // Utilisation de PapaParse pour lire les CSV
import { GridContext } from '../../context/GridContext'

const parseCSVFile = (file, onSuccess, onError) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: onSuccess,
    error: onError
  })
}

const CSVImporter = () => {
  const { state, dispatch } = useContext(GridContext) // Récupération de state et dispatch

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      parseCSVFile(
        file,
        (results) => {
          const rows = results.data
          if (rows.length > state.grid.length) {
            alert(
              `Attention : Votre fichier CSV contient ${rows.length} lignes, mais la grille actuelle ne peut afficher que ${state.grid.length} cellules.`
            )
          }
          dispatch({ type: 'IMPORT_CSV', payload: rows })
        },
        (error) => {
          console.error('Erreur lors de l’importation CSV :', error)
          alert('Une erreur est survenue lors de l’importation du fichier CSV.')
        }
      )
    }
  }

  return (
    <div className="space-y-4 rounded bg-white p-4 shadow dark:bg-gray-800">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        Importer un fichier CSV
      </h4>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded file:border file:border-gray-300 file:bg-gray-50 file:px-4 file:py-2 file:text-gray-700 hover:file:bg-gray-200 focus:outline-none focus:ring focus:ring-blue-300 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600"
      />
    </div>
  )
}

export default CSVImporter
