// hooks/useCsvImporter.js
import { useCallback } from 'react'
import Papa from 'papaparse'

const useCsvImporter = (canvas, onAddTextCsv, onAddQrCodeCsv, dispatch) => {
  const importData = useCallback(
    (file) => {
      if (!canvas) return

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const newObjects = {}
          const importedCellIndices = []

          for (let index = 0; index < results.data.length; index++) {
            const { Nom, Tarif, Gencode } = results.data[index]
            const cellIndex = index

            canvas.clear()
            canvas.backgroundColor = 'white'
            canvas.renderAll()

            if (Nom) await onAddTextCsv(Nom)
            if (Tarif) await onAddTextCsv(`${Tarif}€`)
            if (Gencode) await new Promise((resolve) => onAddQrCodeCsv(Gencode, resolve))

            newObjects[cellIndex] = JSON.stringify(canvas.toJSON())
            importedCellIndices.push(cellIndex)
          }

          dispatch({ type: 'SET_OBJECTS', payload: newObjects })

          if (importedCellIndices.length > 1) {
            dispatch({
              type: 'ADD_LINKED_CELLS',
              payload: {
                primaryCell: importedCellIndices[0],
                linkedCellIndices: importedCellIndices.slice(1)
              }
            })
          }
        },
        error: (error) => console.error("Erreur lors de l'importation du fichier CSV", error)
      })
    },
    [canvas, onAddTextCsv, onAddQrCodeCsv, dispatch]
  )

  return { importData }
}

export default useCsvImporter
