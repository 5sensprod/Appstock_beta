import React, { useEffect, createContext, useRef, useContext, useReducer, useCallback } from 'react'
import useCanvasObjectHandler from '../hooks/useCanvasObjectHandler'
import useObjectConstraints from '../hooks/useObjectConstraints'
import useCanvasTransform from '../hooks/useCanvasTransform'
import { canvasReducer, initialCanvasState } from '../reducers/canvasReducer'
import useInitializeCanvas from '../hooks/useInitializeCanvas'
import useCanvasObjectManagement from '../hooks/useCanvasObjectManagement'
import useFontManagement from '../hooks/useFontManagement'
import useCanvasObjectActions from '../hooks/useCanvasObjectActions' // Import du nouveau hook

const CanvasContext = createContext()

const useCanvas = () => {
  const context = useContext(CanvasContext)
  if (!context) throw new Error('useCanvas must be used within a CanvasProvider')
  return context
}

const CanvasProvider = ({ children }) => {
  const canvasRef = useRef(null)
  const [canvasState, dispatchCanvasAction] = useReducer(canvasReducer, initialCanvasState)

  const {
    canvas,
    zoomLevel,
    selectedColor,
    selectedFont,
    selectedObject,
    labelConfig,
    selectedCellIndex
  } = canvasState

  // Initialisation et transformations du canevas
  useInitializeCanvas(canvas, labelConfig, dispatchCanvasAction, canvasRef)
  const { updateCanvasSize, handleZoomChange } = useCanvasTransform(
    canvas,
    labelConfig,
    dispatchCanvasAction
  )

  const selectCell = useCallback(
    (cellIndex) => {
      if (!canvas) return // Vérifie que le canevas est bien initialisé

      // Sauvegarde des objets actuels dans la cellule actuelle
      const currentObjects = canvas.getObjects()
      dispatchCanvasAction({
        type: 'SET_CELL_OBJECTS',
        payload: { cellIndex: selectedCellIndex, objects: currentObjects }
      })

      // Efface le canevas pour la nouvelle cellule
      canvas.clear()

      // Réinitialise le fond blanc pour la cellule sélectionnée
      canvas.backgroundColor = 'white'

      // Charge les objets pour la cellule nouvellement sélectionnée
      const cellObjects = canvasState.cellObjects[cellIndex] || []
      cellObjects.forEach((obj) => {
        canvas.add(obj)
      })

      // Met à jour l'index de la cellule sélectionnée
      dispatchCanvasAction({ type: 'SELECT_CELL', payload: cellIndex })

      // Rendu du canevas avec le fond et les objets mis à jour
      canvas.renderAll()
    },
    [canvas, selectedCellIndex, canvasState.cellObjects, dispatchCanvasAction]
  )

  useEffect(() => {
    console.log('CanvasProvider - Selected Cell Index:', selectedCellIndex)
  }, [selectedCellIndex])

  useEffect(() => {
    if (canvas && selectedCellIndex === null) {
      // Ne s'exécute qu'au montage
      selectCell(0)
    }
  }, [canvas, selectCell, selectedCellIndex])
  // Gestion des objets sur le canevas
  useCanvasObjectHandler(canvas, selectedObject, selectedColor, selectedFont, dispatchCanvasAction)
  useObjectConstraints(canvas)

  // Utilisation de useCanvasObjectActions pour gérer l'ajout/suppression d'objets
  const {
    // addObjectToCanvas,
    onDeleteObject,
    onAddCircle,
    onAddRectangle,
    onAddText,
    onAddTextCsv,
    onAddImage,
    onAddQrCode,
    onUpdateQrCode,
    onAddQrCodeCsv
  } = useCanvasObjectActions(canvas, labelConfig, selectedColor, selectedFont)

  // Vérifications de type d'objet et gestion de la touche "Delete"
  const { isShapeSelected, isTextSelected, isImageSelected, isQRCodeSelected } =
    useCanvasObjectManagement(canvas, selectedObject, onDeleteObject)

  // Gestion de la police de l'objet sélectionné
  useFontManagement(canvas, selectedObject, selectedFont)

  const value = {
    canvasRef,
    canvas,
    zoomLevel,
    updateCanvasSize,
    handleZoomChange,
    labelConfig,
    setLabelConfig: (config) => dispatchCanvasAction({ type: 'SET_LABEL_CONFIG', payload: config }),
    selectedColor,
    setSelectedColor: (color) => dispatchCanvasAction({ type: 'SET_COLOR', payload: color }),
    selectedObject,
    setSelectedObject: (obj) => dispatchCanvasAction({ type: 'SET_SELECTED_OBJECT', payload: obj }),
    selectedFont,
    setSelectedFont: (font) => dispatchCanvasAction({ type: 'SET_FONT', payload: font }),
    // Actions centralisées pour les objets
    onAddCircle,
    onAddRectangle,
    onAddText,
    onAddTextCsv,
    onAddImage,
    onAddQrCode,
    onAddQrCodeCsv,
    onUpdateQrCode,
    onDeleteObject,
    // Vérifications de type d'objet
    isShapeSelected,
    isTextSelected,
    isImageSelected,
    isQRCodeSelected,
    dispatchCanvasAction,
    selectedCellIndex,
    selectCell,
    canvasState
  }

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
}

export { CanvasContext, CanvasProvider, useCanvas }
