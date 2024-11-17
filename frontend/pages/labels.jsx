import React from 'react'
import { GridProvider } from '../context/GridContext'
import { CanvasProvider } from '../context/CanvasContext'
import GridConfigurator from '../components/labelsgenerator/GridConfigurator'
import GridManager from '../components/labelsgenerator/GridManager'
import CanvasEditor from '../components/labelsgenerator/CanvasEditor'

const LabelsPage = () => {
  return (
    <GridProvider>
      <CanvasProvider>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            height: '100vh',
            overflow: 'hidden'
          }}
        >
          {/* Canvas Section */}
          <div
            style={{
              flex: 3,
              padding: '20px',
              backgroundColor: '#f5f5f5',
              borderRight: '1px solid #ddd',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Aperçu de l'Étiquette</h2>
            <CanvasEditor />
          </div>

          {/* Configuration & Grid Section */}
          <div
            style={{
              flex: 5,
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              overflowY: 'auto'
            }}
          >
            {/* Configuration */}
            <div style={{ flex: 1, marginBottom: '20px' }}>
              <GridConfigurator />
            </div>

            {/* Grid */}
            <div style={{ flex: 2 }}>
              <GridManager />
            </div>
          </div>
        </div>
      </CanvasProvider>
    </GridProvider>
  )
}

export default LabelsPage
