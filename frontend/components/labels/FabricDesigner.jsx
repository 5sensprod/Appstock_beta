import React from 'react'
import styles from './FabricDesigner.module.css'
import ColorPicker from './texttool/ColorPicker'
import CanvasControl from './CanvasControl'
import Menu from './Menu'
import ZoomControl from './ZoomControl'
import CopyDesignButton from './CopyDesignButton'
import PasteDesignButton from './PasteDesignButton'
import { useCanvas } from '../../context/CanvasContext'
import { InstanceProvider, useInstance } from '../../context/InstanceContext'

export default function FabricDesigner() {
  const { canvasRef, zoomLevel, handleZoomChange, onAddCircle, onAddRectangle, onAddText } =
    useCanvas()
  const { handleColorChange, selectedColor } = useInstance()

  return (
    <InstanceProvider>
      <div className={styles.app}>
        <Menu onAddCircle={onAddCircle} onAddRectangle={onAddRectangle} onAddText={onAddText} />
        <ColorPicker color={selectedColor} setTextStyle={handleColorChange} />
        <div className="flex items-center space-x-2">
          <CopyDesignButton />
          <PasteDesignButton />
          <ZoomControl zoomLevel={zoomLevel} handleZoomChange={handleZoomChange} />
        </div>
        <CanvasControl canvasRef={canvasRef} />
      </div>
    </InstanceProvider>
  )
}
