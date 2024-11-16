import { useCallback } from 'react'
import { mmToPx } from '../utils/conversionUtils'

const useAddObjectToCanvas = (labelConfig) => {
  const centerObject = useCallback(
    (object) => {
      if (!labelConfig) return

      const centerX = mmToPx(labelConfig.labelWidth / 2)
      const centerY = mmToPx(labelConfig.labelHeight / 2)

      object.set({
        left: centerX - object.getScaledWidth() / 2,
        top: centerY - object.getScaledHeight() / 2
      })

      return object
    },
    [labelConfig]
  )

  return { centerObject }
}

export default useAddObjectToCanvas
