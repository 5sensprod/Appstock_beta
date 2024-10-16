import React, { useState } from 'react'
import LabelPreview from './LabelPreview'
import ZoomControls from './ZoomControls'
import ConfigForm from './ConfigForm'
import LayoutGrid from './LayoutGrid'
import TextTool from './texttool/TextTool'

const LabelDesigner = () => {
  const [zoomLevel, setZoomLevel] = useState(100)
  const [labelConfig, setLabelConfig] = useState({
    labelWidth: 48.5,
    labelHeight: 25.5,
    offsetTop: 22,
    offsetLeft: 8,
    spacingVertical: 0,
    spacingHorizontal: 0
  })

  const [textStyle, setTextStyle] = useState({
    fontFamily: 'Arial',
    fontSize: '16px',
    color: '#000000',
    textAlign: 'left'
  })

  const [
    textOptionsVisible,
    setTextOptionsVisible
  ] = useState(false)

  // État pour gérer les éléments texte ajoutés
  const [textElements, setTextElements] =
    useState([])

  // Fonction pour ajouter un nouvel élément texte
  const addTextElement = () => {
    setTextElements([
      ...textElements,
      {
        id: Date.now(), // Identifiant unique
        style: {
          ...textStyle,
          position: { top: 0, left: 0 }
        }, // On peut personnaliser davantage
        content: 'Nouveau texte'
      }
    ])
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col rounded-lg bg-light-background p-6 shadow-lg dark:bg-dark-background lg:flex-row">
      {/* Left Panel */}
      <div className="border-r border-gray-300 p-6 lg:w-[49%]">
        <h2 className="mb-4 text-xl font-semibold">
          Aperçu de l'Étiquette
        </h2>
        <LabelPreview
          labelConfig={labelConfig}
          zoomLevel={zoomLevel}
          textElements={textElements} // On passe les éléments texte ici
          textStyle={textStyle}
          textOptionsVisible={textOptionsVisible}
        />
        <ZoomControls
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
        />
        <TextTool
          addTextElement={addTextElement} // On passe la fonction ici
          textStyle={textStyle}
          setTextStyle={setTextStyle}
          textOptionsVisible={textOptionsVisible}
          setTextOptionsVisible={
            setTextOptionsVisible
          }
        />
      </div>

      {/* Right Panel */}
      <div className="p-6 lg:w-[51%]">
        <div className="rounded-lg border border-gray-300 bg-light-background p-4 dark:bg-dark-background">
          <h2 className="mb-4 text-xl font-semibold">
            Configuration
          </h2>
          <ConfigForm
            labelConfig={labelConfig}
            setLabelConfig={setLabelConfig}
          />
        </div>

        <div className="mt-6 rounded-lg border border-gray-300 bg-light-background p-4 dark:bg-dark-background">
          <h2 className="mb-4 text-xl font-semibold">
            Disposition sur A4
          </h2>
          <LayoutGrid labelConfig={labelConfig} />
        </div>
      </div>
    </div>
  )
}

export default LabelDesigner
