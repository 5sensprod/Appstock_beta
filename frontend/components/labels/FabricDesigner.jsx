import React from 'react'
import styles from './FabricDesigner.module.css'
import ColorPicker from './texttool/ColorPicker'
import CanvasControl from './CanvasControl'
import Menu from './Menu'
import ZoomControl from './ZoomControl'
import CopyDesignButton from './CopyDesignButton'
import PasteDesignButton from './PasteDesignButton'
import { useCanvas } from '../../context/CanvasContext'
import { InstanceProvider } from '../../context/InstanceContext'
import { useInstance } from '../../context/InstanceContext'

export default function FabricDesigner() {
  const { canvasRef, zoomLevel, handleZoomChange, onAddCircle, onAddRectangle, onAddText } =
    useCanvas()

  const { handleColorChange, selectedColor } = useInstance()

  return (
    <InstanceProvider>
      <div className={styles.app}>
        {/* Section pour ajouter des formes et du texte */}
        <Menu onAddCircle={onAddCircle} onAddRectangle={onAddRectangle} onAddText={onAddText} />

        {/* Sélecteur de couleur */}
        <ColorPicker color={selectedColor} setTextStyle={handleColorChange} />

        {/* Contrôle de zoom et bouton de copie */}
        <div className="flex items-center space-x-2">
          <CopyDesignButton /> {/* Bouton de copie */}
          <PasteDesignButton /> {/* Bouton de collage */}
          <ZoomControl zoomLevel={zoomLevel} handleZoomChange={handleZoomChange} />
        </div>

        {/* Conteneur du canevas */}
        <CanvasControl canvasRef={canvasRef} />
      </div>
    </InstanceProvider>
  )
}
