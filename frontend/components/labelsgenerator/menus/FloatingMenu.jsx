import React, { useState, useEffect, useCallback, useRef } from 'react'
import styles from '../FabricDesigner.module.css'
import StyleMenu from './StyleMenu'

export default function FloatingMenu({ onUpdateQrCode }) {
  const menuRef = useRef(null)
  const [position, setPosition] = useState({ x: -1, y: -1 }) // -1 pour forcer le calcul initial
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (position.x === -1 && position.y === -1) {
      const container = document.querySelector(`.${styles.canvasContainer}`)
      if (container) {
        const rect = container.getBoundingClientRect()
        setPosition({
          x: rect.left + 20,
          y: rect.top + 20
        })
      }
    }
  }, [position])

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging && menuRef.current) {
        const container = document.querySelector(`.${styles.canvasContainer}`)
        const rect = container.getBoundingClientRect()
        const menuRect = menuRef.current.getBoundingClientRect()

        let newX = e.clientX - startPos.x
        let newY = e.clientY - startPos.y

        newX = Math.max(rect.left, Math.min(rect.right - menuRect.width, newX))
        newY = Math.max(rect.top, Math.min(rect.bottom - menuRect.height, newY))

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
      ref={menuRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        visibility: position.x === -1 ? 'hidden' : 'visible'
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
      <StyleMenu onUpdateQrCode={onUpdateQrCode} />
    </div>
  )
}
