import React, { useEffect, useState, useRef } from 'react'
import styles from './FabricDesigner.module.css'
import { useCanvas } from '../../context/CanvasContext'

const CanvasControl = () => {
  const { canvasRef, canvas } = useCanvas()
  const containerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [lastX, setLastX] = useState(0)
  const [lastY, setLastY] = useState(0)

  useEffect(() => {
    if (!canvas) return
    canvas.backgroundColor = 'white'
    canvas.renderAll()
  }, [canvas])

  const handleMouseDown = (e) => {
    if (!canvas || canvas.getActiveObject()) return

    e.preventDefault()
    setIsDragging(true)
    setLastX(e.clientX)
    setLastY(e.clientY)
    e.currentTarget.style.cursor = 'grabbing'
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !canvas || !containerRef.current) return

    const deltaX = e.clientX - lastX
    const deltaY = e.clientY - lastY

    const canvasContainer = canvas.wrapperEl

    // Obtenir la position actuelle avec parseFloat pour plus de précision
    const currentLeft = parseFloat(canvasContainer.style.left) || 0
    const currentTop = parseFloat(canvasContainer.style.top) || 0

    // Appliquer le déplacement
    const newLeft = currentLeft + deltaX
    const newTop = currentTop + deltaY

    canvasContainer.style.left = `${newLeft}px`
    canvasContainer.style.top = `${newTop}px`

    setLastX(e.clientX)
    setLastY(e.clientY)
  }

  const handleMouseUp = (e) => {
    if (isDragging) {
      setIsDragging(false)
      e.currentTarget.style.cursor = 'grab'
    }
  }

  return (
    <div
      ref={containerRef}
      className={styles.canvasContainer}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsDragging(false)
        if (containerRef.current) {
          containerRef.current.style.cursor = 'grab'
        }
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.cursor = 'grab'
      }}
    >
      <canvas ref={canvasRef} />
      <style jsx>{`
        :global(.canvas-container) {
          background-color: white;
          position: relative;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  )
}

export default CanvasControl
