import React, { useCallback, useRef } from 'react'

const GradientSlider = ({
  colors,
  activeStop,
  onStopSelect,
  onPositionChange,
  offsets = [0, 1]
}) => {
  const sliderRef = useRef(null)

  const handleMouseDown = useCallback(
    (stopIndex, e) => {
      e.preventDefault()
      e.stopPropagation()

      const handleMouseMove = (moveEvent) => {
        if (!sliderRef.current) return
        const rect = sliderRef.current.getBoundingClientRect()
        const x = moveEvent.clientX - rect.left
        const width = rect.width

        // Calculer le nouvel offset (0-1)
        let newOffset = Math.max(0, Math.min(1, x / width))

        // Empêcher les stops de se croiser en utilisant les offsets actuels
        const otherOffset = offsets[stopIndex === 0 ? 1 : 0]
        if (stopIndex === 0) {
          newOffset = Math.min(newOffset, otherOffset - 0.05)
        } else {
          newOffset = Math.max(newOffset, otherOffset + 0.05)
        }

        // Notifier le parent du changement
        onPositionChange(stopIndex, newOffset)
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [offsets, onPositionChange]
  )

  return (
    <div
      ref={sliderRef}
      className="relative h-8 cursor-pointer rounded-lg"
      style={{
        background: `linear-gradient(to right, ${colors[0]}, ${colors[1]})`
      }}
    >
      {[0, 1].map((index) => (
        <button
          key={index}
          className={`absolute top-1/2 -mt-2 h-4 w-4 cursor-move rounded-full border-2 ${
            activeStop === index ? 'border-blue-500' : 'border-white'
          }`}
          style={{
            background: colors[index],
            left: `${offsets[index] * 100}%`,
            transform: 'translateX(-50%)',
            zIndex: 10
          }}
          onClick={() => onStopSelect(index)}
          onMouseDown={(e) => handleMouseDown(index, e)}
        />
      ))}
    </div>
  )
}

export default GradientSlider
