import React from 'react'
import styles from './FabricDesigner.module.css'
import CanvasControl from './CanvasControl'
import Menu from './Menu'
import ZoomControl from './ZoomControl'
import FloatingMenu from './menus/FloatingMenu'
import { useCanvas } from '../../context/CanvasContext'

export default function FabricDesigner() {
  const { onUpdateQrCode } = useCanvas()

  return (
    <div className={styles.app}>
      <Menu />
      <div className="flex items-center space-x-2">
        <ZoomControl />
      </div>
      <FloatingMenu onUpdateQrCode={onUpdateQrCode} />
      <CanvasControl />
    </div>
  )
}
