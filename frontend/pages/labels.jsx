import React, { useState } from 'react'
import FabricDesigner from '../components/labels/FabricDesigner'
import ConfigForm from '../components/labels/ConfigForm'
import LayoutGrid from '../components/labels/LayoutGrid'
// import PropagationOptions from '../components/labels/PropagationOptions'
import { CanvasProvider } from '../context/CanvasContext'
import { InstanceProvider } from '../context/InstanceContext' // Import du nouveau contexte
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

const Labels = () => {
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true)

  const toggleRightPanel = () => {
    setIsRightPanelVisible(!isRightPanelVisible)
  }

  return (
    <CanvasProvider>
      <InstanceProvider>
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
            {isRightPanelVisible && (
              <>
                <div className="rounded-lg border border-gray-300 bg-light-background p-4 dark:bg-dark-background">
                  <h2 className="mb-4 text-xl font-semibold">Configuration</h2>
                  <ConfigForm />
                </div>

                {/* Options de propagation */}
                {/* <PropagationOptions /> */}

                {/* Section Disposition sur A4 */}
                <div className="mt-6 rounded-lg border border-gray-300 bg-light-background p-4 dark:bg-dark-background">
                  <h2 className="mb-4 text-xl font-semibold">Disposition sur A4</h2>
                  <LayoutGrid />
                </div>
              </>
            )}
          </div>
        </div>
      </InstanceProvider>
    </CanvasProvider>
  )
}

export default Labels
