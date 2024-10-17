import React from 'react'
import FabricDesigner from '../components/labels/FabricDesigner'
import ConfigForm from '../components/labels/ConfigForm'
import LayoutGrid from '../components/labels/LayoutGrid'
import { CanvasProvider } from '../context/CanvasContext' // Pas besoin de useCanvas ici

const Labels = () => {
  return (
    <CanvasProvider>
      <div className="mx-auto flex w-full max-w-5xl flex-col rounded-lg bg-light-background p-6 shadow-lg dark:bg-dark-background lg:flex-row">
        {/* Left Panel */}
        <div className="border-r border-gray-300 p-6 lg:w-[49%]">
          <h2 className="mb-4 text-xl font-semibold">Aperçu de l'Étiquette</h2>
          <FabricDesigner />
        </div>

        {/* Right Panel */}
        <div className="p-6 lg:w-[51%]">
          {/* Section Configuration */}
          <div className="rounded-lg border border-gray-300 bg-light-background p-4 dark:bg-dark-background">
            <h2 className="mb-4 text-xl font-semibold">Configuration</h2>
            <ConfigForm />
          </div>

          {/* Section Disposition sur A4 */}
          <div className="mt-6 rounded-lg border border-gray-300 bg-light-background p-4 dark:bg-dark-background">
            <h2 className="mb-4 text-xl font-semibold">Disposition sur A4</h2>
            <LayoutGrid />
          </div>
        </div>
      </div>
    </CanvasProvider>
  )
}

export default Labels
