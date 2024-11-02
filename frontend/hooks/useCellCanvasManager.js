import { useCallback } from 'react'

const useCellCanvasManager = (canvas, instanceState, dispatchInstanceAction) => {
  const loadCellDesign = useCallback(
    (cellIndex) => {
      if (!canvas) return
      canvas.clear()
      canvas.backgroundColor = 'white'

      // Récupère le design de la cellule principale si la cellule est liée
      const primaryCell =
        Object.keys(instanceState.linkedCells).find((primary) =>
          instanceState.linkedCells[primary].includes(cellIndex)
        ) || cellIndex

      const design = instanceState.objects[primaryCell]

      if (design) {
        canvas.loadFromJSON(design, () => {
          canvas.getObjects().forEach((obj) => {
            if (obj.isQRCode) {
              obj.set({
                selectable: true,
                evented: true,
                hasControls: true,
                hasBorders: true
              })
              obj.toObject = (function (toObject) {
                return function () {
                  return {
                    ...toObject.call(this),
                    isQRCode: this.isQRCode,
                    qrText: this.qrText
                  }
                }
              })(obj.toObject)
            }
          })
          canvas.requestRenderAll()
        })
      } else {
        canvas.requestRenderAll()
      }
    },
    [canvas, instanceState.objects, instanceState.linkedCells]
  )

  const saveChanges = useCallback(() => {
    if (!canvas) return

    // Traiter les objets QR Code dans le canevas
    canvas.getObjects().forEach((obj) => {
      if (obj.isQRCode) {
        obj.toObject = (function (toObject) {
          return function () {
            return {
              ...toObject.call(this),
              isQRCode: this.isQRCode,
              qrText: this.qrText
            }
          }
        })(obj.toObject)
      }
    })

    const currentDesign = canvas.toJSON()
    const updatedObjects = { ...instanceState.objects }

    instanceState.selectedCells.forEach((cellIndex) => {
      if (canvas.getObjects().length > 0) {
        updatedObjects[cellIndex] = currentDesign
      } else {
        delete updatedObjects[cellIndex]
      }

      // Vérifie si cette cellule est liée à d'autres et propage le design
      const linkedCells = instanceState.linkedCells[cellIndex]
      if (linkedCells) {
        linkedCells.forEach((linkedCellIndex) => {
          updatedObjects[linkedCellIndex] = currentDesign // Applique le design à chaque cellule liée
        })
      }
    })

    // Met à jour l'état global des objets et réinitialise `unsavedChanges`
    dispatchInstanceAction({ type: 'SET_OBJECTS', payload: updatedObjects })
    dispatchInstanceAction({ type: 'RESET_UNSAVED_CHANGES' })
  }, [
    canvas,
    instanceState.selectedCells,
    instanceState.linkedCells,
    instanceState.objects,
    dispatchInstanceAction
  ])

  const copyDesign = useCallback(() => {
    if (canvas) dispatchInstanceAction({ type: 'SET_COPIED_DESIGN', payload: canvas.toJSON() })
  }, [canvas, dispatchInstanceAction])

  const pasteDesign = useCallback(() => {
    if (!canvas || !instanceState.copiedDesign) return
    instanceState.selectedCells.forEach((cellIndex) => {
      canvas.clear()
      canvas.loadFromJSON(instanceState.copiedDesign, () => canvas.requestRenderAll())
      dispatchInstanceAction({
        type: 'SAVE_CELL_DESIGN',
        payload: { cellIndex, design: instanceState.copiedDesign }
      })
    })
  }, [canvas, instanceState.copiedDesign, instanceState.selectedCells, dispatchInstanceAction])

  const clearCellDesign = useCallback(
    (cellIndex) => {
      if (!canvas) return
      canvas.clear()
      canvas.backgroundColor = 'white'
      canvas.requestRenderAll()
      dispatchInstanceAction({ type: 'CLEAR_CELL_DESIGN', payload: { cellIndex } })
    },
    [canvas, dispatchInstanceAction]
  )

  return {
    loadCellDesign,
    saveChanges,
    copyDesign,
    pasteDesign,
    clearCellDesign
  }
}

export default useCellCanvasManager
