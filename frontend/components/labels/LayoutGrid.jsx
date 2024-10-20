import React from 'react'
import useCellSelection from '../../hooks/useCellSelection'
import exportGridToPDF from '../../utils/exportGridToPDF'
import { useCanvas } from '../../context/CanvasContext'
import { useInstance } from '../../context/InstanceContext'

const LayoutGrid = () => {
  useCellSelection() // Gère la grille et la sélection des cellules
  const { labelConfig } = useCanvas() // Récupérer les configurations du Canvas
  const { cellDesigns, loadCellDesign } = useInstance() // Récupérer les designs des cellules et la fonction de chargement

  const handleExportPDF = () => {
    console.log('Configuration de la grille:', labelConfig)
    console.log('Designs des cellules:', cellDesigns)

    // Exporter en PDF
    exportGridToPDF(labelConfig, cellDesigns, loadCellDesign)
  }

  return (
    <div>
      <button onClick={handleExportPDF} className="mt-4 rounded bg-blue-500 p-2 text-white">
        Exporter en PDF
      </button>
      <div className="relative w-full border-2 border-gray-300 bg-light-background pb-[141.4%] shadow-xl dark:bg-dark-background">
        <div id="gridContainer" className="absolute left-0 top-0 size-full"></div>
      </div>
    </div>
  )
}

export default LayoutGrid
