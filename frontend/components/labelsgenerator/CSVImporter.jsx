import React, { useContext } from 'react'
import Papa from 'papaparse' // Utilisation de PapaParse pour lire les CSV
import { GridContext } from '../../context/GridContext'

const CSVImporter = () => {
  const { state, dispatch } = useContext(GridContext)

  const handleFileUpload = (e) => {
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: ({ data: rows }) => {
        if (rows.length > state.grid.length) {
          alert(`CSV: ${rows.length} lignes > capacité grille: ${state.grid.length}`)
        }
        dispatch({ type: 'IMPORT_CSV', payload: rows })
      },
      error: () => alert('Erreur import CSV')
    })
  }

  return (
    <div className="rounded bg-white p-4 shadow">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="w-full file:mr-4 file:rounded file:border file:px-4 file:py-2"
      />
    </div>
  )
}

export default CSVImporter
