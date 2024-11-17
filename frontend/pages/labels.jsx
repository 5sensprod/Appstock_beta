import React from 'react'
import { GridProvider } from '../context/GridContext'
import GridConfigurator from '../components/labelsgenerator/GridConfigurator'
import GridManager from '../components/labelsgenerator/GridManager'

const LabelsPage = () => {
  return (
    <GridProvider>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', padding: '20px' }}>
        {/* Configuration Panel */}
        <div style={{ flex: 1 }}>
          <GridConfigurator />
        </div>

        {/* Grid Preview */}
        <div style={{ flex: 2 }}>
          <GridManager />
        </div>
      </div>
    </GridProvider>
  )
}

export default LabelsPage
