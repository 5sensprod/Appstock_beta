import { useCallback } from 'react'

const useCellCanvasManager = (canvas, instanceState, dispatchInstanceAction) => {
  const loadCellDesign = useCallback(
    (cellIndex) => {
      if (!canvas) return
      canvas.clear()
      canvas.backgroundColor = 'white'
      const design = instanceState.objects[cellIndex]

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
    [canvas, instanceState.objects]
  )

  const saveChanges = useCallback(() => {
    if (!canvas) return

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

      if (instanceState.linkedCells[cellIndex]) {
        dispatchInstanceAction({
          type: 'UPDATE_LINKED_CELLS',
          payload: { primaryCell: cellIndex, design: currentDesign }
        })
      }
    })

    dispatchInstanceAction({ type: 'SET_OBJECTS', payload: updatedObjects })
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
