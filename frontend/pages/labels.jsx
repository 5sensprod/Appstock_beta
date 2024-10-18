import React, { useState } from 'react'
import FabricDesigner from '../components/labels/FabricDesigner'
import ConfigForm from '../components/labels/ConfigForm'
import LayoutGrid from '../components/labels/LayoutGrid'
import { CanvasProvider, useCanvas } from '../context/CanvasContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

const Labels = () => {
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true)

  const toggleRightPanel = () => {
    setIsRightPanelVisible(!isRightPanelVisible)
  }

  return (
    <CanvasProvider>
      <div className="mx-auto flex flex-col rounded-lg bg-light-background p-6 shadow-lg dark:bg-dark-background lg:flex-row">
        {/* Left Panel */}
        <div
          className={`border-r border-gray-300 p-6 transition-all duration-300 ${
            isRightPanelVisible ? 'lg:w-3/5' : 'lg:w-full'
          }`}
        >
          <h2 className="mb-4 text-xl font-semibold">Aperçu de l'Étiquette</h2>
          <FabricDesigner />
        </div>

        {/* Chevron for toggling Right Panel */}
        <div className="flex items-center justify-center">
          <button onClick={toggleRightPanel} className="mx-2">
            <FontAwesomeIcon
              icon={isRightPanelVisible ? faChevronLeft : faChevronRight}
              size="lg"
              className="transition-colors duration-300 hover:text-blue-500"
            />
          </button>
        </div>

        {/* Right Panel */}
        <div
          className={`transition-all duration-300 ${
            isRightPanelVisible ? 'p-6 lg:w-2/5' : 'w-0 overflow-hidden p-0'
          }`}
        >
          {/* Section Configuration */}
          {isRightPanelVisible && (
            <>
              <div className="rounded-lg border border-gray-300 bg-light-background p-4 dark:bg-dark-background">
                <h2 className="mb-4 text-xl font-semibold">Configuration</h2>
                <ConfigForm />
              </div>

              {/* Section Disposition sur A4 */}
              <div className="mt-6 rounded-lg border border-gray-300 bg-light-background p-4 dark:bg-dark-background">
                <h2 className="mb-4 text-xl font-semibold">Disposition sur A4</h2>
                <LayoutGrid />
              </div>

              {/* Options de propagation */}
              <PropagationOptions />
            </>
          )}
        </div>
      </div>
    </CanvasProvider>
  )
}

// Composant pour les options de propagation
const PropagationOptions = () => {
  const {
    propagateDesignToCells,
    isPropagationEnabled,
    setIsPropagationEnabled,
    cellsToPropagate,
    setCellsToPropagate,
    totalCells
  } = useCanvas()

  return (
    <div className="mt-4">
      {/* Activation/Désactivation de la propagation */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={isPropagationEnabled}
            onChange={(e) => setIsPropagationEnabled(e.target.checked)}
          />
          Activer la propagation
        </label>
      </div>

      {/* Nombre de cellules à propager */}
      <div>
        <label>
          Nombre de cellules à propager :
          <input
            type="number"
            value={cellsToPropagate}
            onChange={(e) => setCellsToPropagate(Math.min(totalCells, Math.max(1, e.target.value)))}
            min="1"
            max={totalCells}
          />
        </label>
      </div>

      {/* Bouton pour appliquer la propagation */}
      <button
        onClick={propagateDesignToCells}
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
      >
        Appliquer à {isPropagationEnabled ? 'toutes les cellules' : `${cellsToPropagate} cellules`}
      </button>
    </div>
  )
}

export default Labels
