import React from 'react'
import styles from './FabricDesigner.module.css'
import ColorPicker from './texttool/ColorPicker'
import CanvasControl from './CanvasControl'
import Menu from './Menu'
import ZoomControl from './ZoomControl'
import CopyDesignButton from './CopyDesignButton'
import PasteDesignButton from './PasteDesignButton'
import { useCanvas } from '../../context/CanvasContext'
import { useInstance } from '../../context/InstanceContext'

export default function FabricDesigner() {
  const { canvasRef, zoomLevel, handleZoomChange } = useCanvas()
  const { handleColorChange, selectedColor } = useInstance()

  return (
    <div className={styles.app}>
      <Menu /> {/* Plus besoin de passer les props ici */}
      <ColorPicker color={selectedColor} setTextStyle={handleColorChange} />
      <div className="flex items-center space-x-2">
        <CopyDesignButton />
        <PasteDesignButton />
        <ZoomControl zoomLevel={zoomLevel} handleZoomChange={handleZoomChange} />
      </div>
      <CanvasControl canvasRef={canvasRef} />
    </div>
  )
}
