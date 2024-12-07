import React, { useState, useCallback, useRef } from 'react'

const GradientSlider = ({ colors, activeStop, onStopSelect, onPositionChange }) => {
  // Garder la position visuelle des points dans le state local
  const [positions, setPositions] = useState([0, 1])
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

        // Empêcher les stops de se croiser
        if (stopIndex === 0) {
          newOffset = Math.min(newOffset, positions[1] - 0.05)
        } else {
          newOffset = Math.max(newOffset, positions[0] + 0.05)
        }

        // Mettre à jour la position visuelle
        const newPositions = [...positions]
        newPositions[stopIndex] = newOffset
        setPositions(newPositions)

        // Notifier le parent
        onPositionChange(stopIndex, newOffset)
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [positions, onPositionChange]
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
          className={`absolute top-1/2 -mt-2 h-4 w-4 cursor-move rounded-full border-2 ${activeStop === index ? 'border-blue-500' : 'border-white'}`}
          style={{
            background: colors[index],
            left: `${positions[index] * 100}%`,
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
