import React from 'react'
import ImportMenu from './menus/ImportMenu'
import SelectedCellDisplay from './SelectedCellDisplay'
import CellSelector from './CellSelector'

const LabelDisplay = () => {
  return (
    <div className="main-component">
      <ImportMenu />
      <CellSelector />
      <SelectedCellDisplay />
    </div>
  )
}

export default LabelDisplay
