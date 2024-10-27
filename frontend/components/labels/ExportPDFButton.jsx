import React, { useState, useEffect } from 'react'
import { useCanvas } from '../../context/CanvasContext'
import { useInstance } from '../../context/InstanceContext'
import { faFilePdf } from '@fortawesome/free-solid-svg-icons'
import exportGridToPDF from '../../utils/exportGridToPDF'
import IconButton from '../ui/IconButton'

const ExportPDFButton = () => {
  const { labelConfig } = useCanvas()
  const { state, saveChanges, unsavedChanges } = useInstance()

  // Ajouter un état pour déclencher l'export PDF une fois la sauvegarde terminée
  const [shouldExport, setShouldExport] = useState(false)

  // Utiliser useEffect pour surveiller les changements dans `state.objects` et déclencher l'export PDF
  useEffect(() => {
    if (shouldExport && Object.keys(state.objects).length > 0) {
      exportGridToPDF(labelConfig, state.objects)
      setShouldExport(false)
    }
  }, [state.objects, shouldExport, labelConfig])

  const handleExportPDF = async () => {
    if (unsavedChanges) {
      await saveChanges()
    }
    setShouldExport(true)
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
