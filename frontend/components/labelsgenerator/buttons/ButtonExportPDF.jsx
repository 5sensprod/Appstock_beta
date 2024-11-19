import React, { useContext } from 'react'
import { GridContext } from '../../../context/GridContext'
import IconButton from '../../ui/IconButton'
import { faFilePdf } from '@fortawesome/free-solid-svg-icons'
import { exportGridToPDF } from '../GridExporter'

const ButtonExportPDF = () => {
  const { state } = useContext(GridContext)

  const handleExportPDF = async () => {
    const { grid, cellContents, config } = state
    await exportGridToPDF(grid, cellContents, config)
  }

  return (
    <IconButton
      onClick={handleExportPDF}
      icon={faFilePdf}
      title="Exporter en PDF"
      className="bg-indigo-500"
      size="w-10 h-10"
      iconSize="text-lg"
    />
  )
}

export default ButtonExportPDF
