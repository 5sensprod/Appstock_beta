import React, {
  useState,
  useEffect,
  useCallback
} from 'react'

// Composant pour l'aperçu de l'étiquette
const LabelPreview = ({
  labelConfig,
  zoomLevel
}) => {
  const updateLabel = useCallback(() => {
    const labelCanvas = document.getElementById(
      'labelCanvas'
    )
    const { labelWidth, labelHeight } =
      labelConfig
    if (labelCanvas) {
      labelCanvas.style.width = `${labelWidth}mm`
      labelCanvas.style.height = `${labelHeight}mm`
      const scale = zoomLevel / 100
      labelCanvas.style.transform = `translate(-50%, -50%) scale(${scale})`
    }
  }, [labelConfig, zoomLevel])

  useEffect(() => {
    updateLabel()
  }, [updateLabel])

  return (
    <div className="relative mb-4 h-96 w-full overflow-hidden border border-gray-300">
      <div
        id="labelCanvas"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-gray-500"
      ></div>
    </div>
  )
}

// Composant pour les contrôles de zoom
const ZoomControls = ({
  zoomLevel,
  setZoomLevel
}) => {
  const changeZoom = (delta) => {
    setZoomLevel((prevZoom) =>
      Math.max(
        10,
        Math.min(500, prevZoom + delta)
      )
    )
  }

  return (
    <div className="flex items-center justify-center space-x-4">
      <button
        className="rounded border bg-gray-200 px-3 py-1 dark:bg-gray-700"
        onClick={() => changeZoom(-10)}
      >
        -
      </button>
      <input
        type="number"
        id="zoomLevel"
        className="w-16 border border-gray-300 text-center dark:bg-dark-background dark:text-dark-text"
        value={zoomLevel}
        onChange={(e) =>
          setZoomLevel(
            Math.max(
              10,
              Math.min(
                500,
                parseInt(e.target.value)
              )
            )
          )
        }
      />
      <span>%</span>
      <button
        className="rounded border bg-gray-200 px-3 py-1 dark:bg-gray-700"
        onClick={() => changeZoom(10)}
      >
        +
      </button>
    </div>
  )
}

// Composant pour le formulaire de configuration
const ConfigForm = ({
  labelConfig,
  setLabelConfig
}) => {
  const handleInputChange = (e) => {
    const { id, value } = e.target
    setLabelConfig((prevConfig) => ({
      ...prevConfig,
      [id]: parseFloat(value)
    }))
  }

  const inputs = [
    { id: 'labelWidth', label: 'Largeur (mm)' },
    { id: 'labelHeight', label: 'Hauteur (mm)' },
    {
      id: 'offsetTop',
      label: 'Offset Haut (mm)'
    },
    {
      id: 'offsetLeft',
      label: 'Offset Gauche (mm)'
    },
    {
      id: 'spacingVertical',
      label: 'Espacement Vertical (mm)'
    },
    {
      id: 'spacingHorizontal',
      label: 'Espacement Horizontal (mm)'
    }
  ]

  return (
    <form className="mb-6 grid grid-cols-2 gap-4">
      {inputs.map((input) => (
        <div key={input.id}>
          <label
            htmlFor={input.id}
            className="block text-gray-600 dark:text-gray-300"
          >
            {input.label}
          </label>
          <input
            type="number"
            id={input.id}
            className="w-full rounded border border-gray-300 p-2 dark:bg-dark-background dark:text-dark-text"
            value={labelConfig[input.id]}
            onChange={handleInputChange}
            step="0.1"
          />
        </div>
      ))}
    </form>
  )
}

// Composant pour la grille de disposition
const LayoutGrid = ({ labelConfig }) => {
  const updateGrid = useCallback(() => {
    const {
      labelWidth,
      labelHeight,
      offsetTop,
      offsetLeft,
      spacingVertical,
      spacingHorizontal
    } = labelConfig
    const pageWidth = 210
    const pageHeight = 297
    const availableWidth = pageWidth - offsetLeft
    const availableHeight = pageHeight - offsetTop

    const labelsPerRow = Math.floor(
      (availableWidth + spacingHorizontal) /
        (labelWidth + spacingHorizontal)
    )
    const labelsPerColumn = Math.floor(
      (availableHeight + spacingVertical) /
        (labelHeight + spacingVertical)
    )

    const gridContainer = document.getElementById(
      'gridContainer'
    )
    if (gridContainer) {
      gridContainer.innerHTML = ''

      for (
        let row = 0;
        row < labelsPerColumn;
        row++
      ) {
        for (
          let col = 0;
          col < labelsPerRow;
          col++
        ) {
          const label =
            document.createElement('div')
          label.className =
            'absolute border border-gray-300 bg-gray-400'
          label.style.width = `${(labelWidth / pageWidth) * 100}%`
          label.style.height = `${(labelHeight / pageHeight) * 100}%`
          label.style.left = `${((offsetLeft + col * (labelWidth + spacingHorizontal)) / pageWidth) * 100}%`
          label.style.top = `${((offsetTop + row * (labelHeight + spacingVertical)) / pageHeight) * 100}%`
          gridContainer.appendChild(label)
        }
      }
    }
  }, [labelConfig])

  useEffect(() => {
    updateGrid()
  }, [updateGrid])

  return (
    <div className="relative w-full border-2 border-gray-300 bg-light-background pb-[141.4%] shadow-xl dark:bg-dark-background">
      <div
        id="gridContainer"
        className="absolute left-0 top-0 size-full"
      ></div>
    </div>
  )
}

// Composant principal LabelDesigner
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
        />
        <ZoomControls
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
        />
      </div>

      {/* Right Panel */}
      <div className="p-6 lg:w-1/2">
        <h2 className="mb-4 text-xl font-semibold">
          Configuration
        </h2>
        <ConfigForm
          labelConfig={labelConfig}
          setLabelConfig={setLabelConfig}
        />
        <h2 className="mb-4 text-xl font-semibold">
          Disposition sur A4
        </h2>
        <LayoutGrid labelConfig={labelConfig} />
      </div>
    </div>
  )
}

export default LabelDesigner
