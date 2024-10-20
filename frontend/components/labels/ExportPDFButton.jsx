import React from 'react'
import { useCanvas } from '../../context/CanvasContext'
import { useInstance } from '../../context/InstanceContext'
import { faFilePdf } from '@fortawesome/free-solid-svg-icons'
import exportGridToPDF from '../../utils/exportGridToPDF'
import IconButton from '../ui/IconButton'

const ExportPDFButton = () => {
  const { labelConfig } = useCanvas()
  const { cellDesigns } = useInstance()

  const handleExportPDF = () => {
    exportGridToPDF(labelConfig, cellDesigns)
  }

  return (
    <IconButton
      onClick={handleExportPDF}
      icon={faFilePdf}
      title="Exporter en PDF"
      className="bg-blue-500 hover:bg-blue-600"
    />
  )
}

export default ExportPDFButton
