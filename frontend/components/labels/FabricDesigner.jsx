import React from 'react'
import styles from './FabricDesigner.module.css'
import CanvasControl from './CanvasControl'
import Menu from './Menu'
import ZoomControl from './ZoomControl'
import CopyDesignButton from './CopyDesignButton'
import PasteDesignButton from './PasteDesignButton'

export default function FabricDesigner() {
  return (
    <div className={styles.app}>
      <Menu />
      <div className="flex items-center space-x-2">
        <CopyDesignButton />
        <PasteDesignButton />
        <ZoomControl />
      </div>
      <CanvasControl />
    </div>
  )
}
