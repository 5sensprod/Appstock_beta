import React, { useState, useCallback, useRef, useEffect } from 'react' // ajout de useEffect

const GradientSlider = ({
  colors,
  activeStop,
  onStopSelect,
  onPositionChange,
  offsets = [0, 1]
}) => {
  const [positions, setPositions] = useState(offsets)
  const sliderRef = useRef(null)

  // Mettre à jour les positions quand les offsets changent
  useEffect(() => {
    if (!arraysAreEqual(positions, offsets)) {
      setPositions(offsets)
    }
  }, [offsets])

  // Fonction utilitaire pour comparer les tableaux
  const arraysAreEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false
    return arr1.every((value, index) => Math.abs(value - arr2[index]) < 0.001) // Utiliser une petite tolérance pour les nombres flottants
  }

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
          className={`absolute top-1/2 -mt-2 h-4 w-4 cursor-move rounded-full border-2 ${
            activeStop === index ? 'border-blue-500' : 'border-white'
          }`}
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
