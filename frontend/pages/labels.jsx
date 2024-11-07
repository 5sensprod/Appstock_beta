// frontend/pages/labels.jsx

import React, { useState } from 'react'
import FabricDesigner from '../components/labels/FabricDesigner'
import ConfigForm from '../components/labels/ConfigForm'
import LayoutGrid from '../components/labels/LayoutGrid'
import ExportPDFButton from '../components/labels/ExportPDFButton'
import { CanvasProvider } from '../context/CanvasContext'
import { InstanceProvider } from '../context/InstanceContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { CellManagerProvider } from '../context/CellManagerContext' // Import du contexte
import LabelDisplay from '../components/labels/LabelDisplay' // Import du composant SelectedCellCanvas

const Labels = () => {
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true)

  const toggleRightPanel = () => {
    setIsRightPanelVisible(!isRightPanelVisible)
  }

  return (
    <CanvasProvider>
      <CellManagerProvider>
        {' '}
        {/* Envelopper avec CellManagerProvider */}
        <InstanceProvider>
          <div className="mx-auto flex flex-col rounded-lg bg-light-background p-6 shadow-lg dark:bg-dark-background lg:flex-row">
            {/* Panneau de gauche */}
            <div
              className={`border-r border-gray-300 p-6 transition-all duration-300 ${
                isRightPanelVisible ? 'lg:w-3/5' : 'lg:w-full'
              }`}
            >
              <h2 className="mb-4 text-xl font-semibold">Aperçu de l'Étiquette</h2>
              <FabricDesigner /> {/* Conserver le composant existant */}
              {/* Ajouter le canevas de la cellule sélectionnée ici */}
              <div className="mt-4 border border-black p-2">
                {' '}
                {/* Encadré d'un trait noir */}
                <LabelDisplay />
              </div>
              {/* <ImportMenu />  */}
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
                    <ConfigForm /> {/* Composant existant */}
                  </div>

                  {/* Section Disposition sur A4 */}
                  <div className="mt-6 rounded-lg border border-gray-300 bg-light-background p-4 dark:bg-dark-background">
                    <div className="flex items-center justify-between">
                      <h2 className="mb-4 text-xl font-semibold">Disposition sur A4</h2>
                      <ExportPDFButton /> {/* Composant existant */}
                    </div>
                    {/* <CellContainer />  */}
                    <LayoutGrid /> {/* Composant existant */}
                  </div>
                </>
              )}
            </div>
          </div>
        </InstanceProvider>
      </CellManagerProvider>
    </CanvasProvider>
  )
}

export default Labels
