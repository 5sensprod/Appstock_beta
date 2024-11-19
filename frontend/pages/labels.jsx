import React, { useState } from 'react'
import { GridProvider } from '../context/GridContext'
import { CanvasProvider } from '../context/CanvasContext'
import GridConfigurator from '../components/labelsgenerator/GridConfigurator'
import LabelsContent from '../components/labelsgenerator/LabelsContent' // Chemin correct pour LabelsContent
import GridManager from '../components/labelsgenerator/GridManager'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

const LabelsPage = () => {
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true)

  const toggleRightPanel = () => {
    setIsRightPanelVisible(!isRightPanelVisible)
  }
  return (
    <GridProvider>
      <CanvasProvider>
        <div className="mx-auto flex flex-col rounded-lg bg-light-background p-6 shadow-lg dark:bg-dark-background lg:flex-row">
          {/* Panneau de gauche */}
          <div
            className={`border-r border-gray-300 p-6 transition-all duration-300 ${
              isRightPanelVisible ? 'lg:w-3/5' : 'lg:w-full'
            }`}
          >
            <h2 className="mb-4 text-xl font-semibold">Aperçu de l'Étiquette</h2>
            <LabelsContent />
          </div>

          {/* Bouton pour afficher/cacher le panneau droit */}
          <div className="flex items-center justify-center">
            <button onClick={toggleRightPanel} className="mx-2">
              <FontAwesomeIcon
                icon={isRightPanelVisible ? faChevronRight : faChevronLeft}
                size="lg"
                className="transition-colors duration-300 hover:text-blue-500"
              />
            </button>
          </div>

          {/* Panneau de droite */}

          <div
            className={`transition-all duration-300 ${
              isRightPanelVisible ? 'p-6 lg:w-2/5' : 'w-0 overflow-hidden p-0'
            }`}
          >
            {isRightPanelVisible && (
              <>
                <div className="rounded-lg border border-gray-300 bg-light-background p-4 dark:bg-dark-background">
                  <h2 className="mb-4 text-xl font-semibold">Configuration</h2>
                  <GridConfigurator />
                </div>

                {/* Section Disposition sur A4 */}
                <div className="mt-6 rounded-lg border border-gray-300 bg-light-background p-4 dark:bg-dark-background">
                  <div className="flex items-center justify-between">
                    <h2 className="mb-4 text-xl font-semibold">Disposition sur A4</h2>
                  </div>
                  {/* <CellContainer />  */}
                  <GridManager />
                </div>
              </>
            )}
          </div>
        </div>
      </CanvasProvider>
    </GridProvider>
  )
}

export default LabelsPage
