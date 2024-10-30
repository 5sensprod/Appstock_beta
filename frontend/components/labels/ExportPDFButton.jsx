import React, { useState, useEffect } from 'react'
import { useCanvas } from '../../context/CanvasContext'
import { useInstance } from '../../context/InstanceContext'
import { faFilePdf } from '@fortawesome/free-solid-svg-icons'
import exportGridToPDF from '../../utils/exportGridToPDF'
import IconButton from '../ui/IconButton'

const ExportPDFButton = () => {
  const { labelConfig } = useCanvas()
  const { instanceState, saveChanges, unsavedChanges } = useInstance()

  // Ajouter un état pour déclencher l'export PDF une fois la sauvegarde terminée
  const [shouldExport, setShouldExport] = useState(false)

  // Utiliser useEffect pour surveiller les changements dans `instanceState.objects` et déclencher l'export PDF
  useEffect(() => {
    if (shouldExport && Object.keys(instanceState.objects).length > 0) {
      exportGridToPDF(labelConfig, instanceState.objects)
      setShouldExport(false)
    }
  }, [instanceState.objects, shouldExport, labelConfig])

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
