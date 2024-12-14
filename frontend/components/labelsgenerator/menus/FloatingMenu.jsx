import React, { useState, useEffect, useCallback } from 'react'
import styles from '../FabricDesigner.module.css'
import ShapeMenu from './ShapeMenu'

export default function FloatingMenu({ onAddCircle, onAddRectangle, onUpdateQrCode }) {
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        const container = document.querySelector(`.${styles.canvasContainer}`)
        const rect = container.getBoundingClientRect()

        let newX = e.clientX - startPos.x
        let newY = e.clientY - startPos.y

        newX = Math.max(rect.left, Math.min(rect.right - 300, newX))
        newY = Math.max(rect.top, Math.min(rect.bottom - 60, newY))

        setPosition({ x: newX, y: newY })
      }
    },
    [isDragging, startPos]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000
      }}
    >
      <div
        className="h-6 cursor-grab bg-gray-200 active:cursor-grabbing"
        onMouseDown={(e) => {
          setIsDragging(true)
          setStartPos({
            x: e.clientX - position.x,
            y: e.clientY - position.y
          })
        }}
      />
      <ShapeMenu
        onAddCircle={onAddCircle}
        onAddRectangle={onAddRectangle}
        onUpdateQrCode={onUpdateQrCode}
      />
    </div>
  )
}
