import React from 'react'
import styles from '../labels/FabricDesigner.module.css'
import MenuCell from './MenuCell'
import Menu from '../labels/Menu'
import ZoomControl from '../labels/ZoomControl'
import CanvasControl from '../labels/CanvasControl'

const LabelsContent = () => {
  return (
    <>
      <div className={styles.app}>
        {/* Canvas Section */}
        <MenuCell />
      </div>
      <div className={styles.app}>
        <Menu />
        <div className="flex items-center space-x-2">
          <ZoomControl />
        </div>
        <CanvasControl />
      </div>
    </>
  )
}

export default LabelsContent
