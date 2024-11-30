import React from 'react'
import styles from './FabricDesigner.module.css'
import CanvasControl from './CanvasControl'
// import CanvasControl from './CanvasControl'
import Menu from './Menu'
import ZoomControl from './ZoomControl'
import MenuCell from '../labelsgenerator/MenuCell'

export default function FabricDesigner() {
  return (
    <div className={styles.app}>
      <MenuCell />
      <Menu />
      <div className="flex items-center space-x-2">
        <ZoomControl />
      </div>
      <CanvasControl />
    </div>
  )
}
