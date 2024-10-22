import React, { useState, useEffect } from 'react'
import { useCanvas } from '../../context/CanvasContext'
import { useInstance } from '../../context/InstanceContext'
import { faFilePdf } from '@fortawesome/free-solid-svg-icons'
import exportGridToPDF from '../../utils/exportGridToPDF'
import IconButton from '../ui/IconButton'

const ExportPDFButton = () => {
  const { labelConfig } = useCanvas()
  const { cellDesigns, saveChanges, unsavedChanges, hasDesignChanged } = useInstance()

  // Ajouter un état pour déclencher l'export PDF une fois la sauvegarde terminée
  const [shouldExport, setShouldExport] = useState(false)

  // Utiliser useEffect pour surveiller les changements dans cellDesigns et déclencher l'export PDF
  useEffect(() => {
    if (shouldExport && Object.keys(cellDesigns).length > 0) {
      // Exporter le PDF uniquement lorsque `cellDesigns` est mis à jour
      console.log('Export PDF déclenché après la mise à jour de cellDesigns')
      exportGridToPDF(labelConfig, cellDesigns)
      setShouldExport(false) // Réinitialiser shouldExport après l'export
    }
  }, [cellDesigns, shouldExport, labelConfig])

  const handleExportPDF = async () => {
    console.log('unsavedChanges:', unsavedChanges)
    console.log('hasDesignChanged:', hasDesignChanged())

    // Vérification des modifications non sauvegardées
    if (unsavedChanges && hasDesignChanged()) {
      const confirmSave = window.confirm(
        'Vous avez des modifications non sauvegardées. Voulez-vous les sauvegarder avant de continuer ?'
      )

      if (confirmSave) {
        // Sauvegarder les modifications avant l'export
        await saveChanges() // Attendre que la sauvegarde soit terminée
        setShouldExport(true) // Indiquer que nous voulons exporter le PDF après la mise à jour de cellDesigns
        return
      }
    }

    // Si aucune sauvegarde n'est nécessaire, exporter immédiatement
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
