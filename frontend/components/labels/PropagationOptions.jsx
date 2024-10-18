import React from 'react'
import { useCanvas } from '../../context/CanvasContext'

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

export default PropagationOptions
