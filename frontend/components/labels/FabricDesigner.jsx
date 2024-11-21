import React from 'react'
import styles from './FabricDesigner.module.css'
import CanvasControl from './CanvasControl copy'
// import CanvasControl from './CanvasControl'
import Menu from './Menu'
import ZoomControl from './ZoomControl'
// import CopyDesignButton from './CopyDesignButton'
// import PasteDesignButton from './PasteDesignButton'
// import ClearCellButton from './ClearCellButton'

export default function FabricDesigner() {
  return (
    <div className={styles.app}>
      <Menu />
      <div className="flex items-center space-x-2">
        {/* <CopyDesignButton />
        <PasteDesignButton />
        <ClearCellButton /> */}
        <ZoomControl />
      </div>
      <CanvasControl />
    </div>
  )
}
