import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react'
import { useCanvas } from './CanvasContext'
import * as fabric from 'fabric'

const GridContext = createContext()

export const useGrid = () => useContext(GridContext)

export const GridProvider = ({ children }) => {
  const { canvas, dispatch } = useCanvas()
  const [selectedCells, setSelectedCells] = useState([0])
  const [cellDesigns, setCellDesigns] = useState({})
  const hasLoadedInitialDesign = useRef(false) // Drapeau pour le chargement initial

  // Sauvegarder le design actuel pour une cellule
  const saveCurrentDesignToCell = useCallback(
    (cellIndex) => {
      if (canvas) {
        const designJSON = canvas.toObject().objects
        console.log(`Sauvegarde du design pour la cellule ${cellIndex}:`, designJSON)
        setCellDesigns((prevDesigns) => ({
          ...prevDesigns,
          [cellIndex]: designJSON
        }))
      }
    },
    [canvas]
  )

  // Charger un design spécifique pour le canevas
  const loadDesignToCanvas = useCallback(
    (cellIndex) => {
      if (!canvas) return
      const cellDesign = cellDesigns[cellIndex] || []
      console.log(`Chargement du design pour la cellule ${cellIndex}:`, cellDesign)

      canvas.clear()
      canvas.backgroundColor = 'white'

      fabric.util.enlivenObjects(cellDesign, (enlivenedObjects) => {
        enlivenedObjects.forEach((obj) => canvas.add(obj))
        canvas.renderAll()
      })
    },
    [canvas, cellDesigns]
  )

  // Gestion de la sélection de cellule
  const handleCellClick = useCallback(
    (cellIndex) => {
      if (selectedCells.length > 0) {
        saveCurrentDesignToCell(selectedCells[0])
      }
      setSelectedCells([cellIndex])
      dispatch({ type: 'SET_SELECTED_CELL', payload: cellIndex })
      loadDesignToCanvas(cellIndex)
    },
    [selectedCells, saveCurrentDesignToCell, loadDesignToCanvas, dispatch]
  )

  // Charger une fois le design de la cellule initiale (cellule 0)
  useEffect(() => {
    if (canvas && !hasLoadedInitialDesign.current) {
      loadDesignToCanvas(0)
      hasLoadedInitialDesign.current = true
    }
  }, [canvas, loadDesignToCanvas])

  const setTotalCells = useCallback((total) => {
    setCellDesigns((prev) => {
      const updatedDesigns = { ...prev }
      for (let i = 0; i < total; i++) {
        if (!updatedDesigns[i]) {
          updatedDesigns[i] = null
        }
      }
      return updatedDesigns
    })
  }, [])

  return (
    <GridContext.Provider
      value={{
        selectedCells,
        handleCellClick,
        cellDesigns,
        setTotalCells
      }}
    >
      {children}
    </GridContext.Provider>
  )
}
