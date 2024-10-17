import React from 'react'
import FabricDesigner from '../components/labels/FabricDesigner'
import { CanvasProvider } from '../context/CanvasContext'

const Labels = () => {
  return (
    <CanvasProvider>
      <div className="p-4">
        <h1 className="mb-4 text-2xl font-bold">
          Gestion des Labels
        </h1>
        <p className="mb-4">
          Ici, vous pouvez gérer vos labels.
        </p>
        <FabricDesigner />
      </div>
    </CanvasProvider>
  )
}

export default Labels
