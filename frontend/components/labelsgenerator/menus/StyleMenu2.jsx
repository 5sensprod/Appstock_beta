// components/labelsgenerator/menus/StyleMenu.jsx
import React, { useState, useRef, useEffect } from 'react'
import {
  faGripVertical,
  faPalette,
  faCircleHalfStroke,
  faSquare
} from '@fortawesome/free-solid-svg-icons'
import styles from '../FabricDesigner.module.css'
import IconButton from '../../ui/IconButton'
import { StrokeControls } from '../StrokeControls'
import { ShadowControls } from '../ShadowControls'
import { AppearanceControls } from '../AppearanceControls'
import { useStyle } from '../../../context/StyleContext'
import { useCanvas } from '../../../context/CanvasContext'

export default function StyleMenu2({ onUpdateQrCode }) {
  const [isStrokeControlOpen, setIsStrokeControlOpen] = useState(false)
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false)
  const [isShadowOpen, setIsShadowOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const menuRef = useRef(null)
  const controlPanelRef = useRef(null)
  const strokePickerRef = useRef(null)
  const appearancePickerRef = useRef(null)
  const shadowPickerRef = useRef(null)
  const hasModifications = useRef(false)

  const { canvas, selectedObject } = useCanvas()
  const {
    handleStrokeChange,
    handleOpacityChange,
    createGradient,
    removeGradient,
    handleShadowChange
  } = useStyle()

  // Reset du flag quand on ouvre un contrôle
  const resetModificationFlag = () => {
    hasModifications.current = false
  }

  // Handler pour marquer qu'il y a eu une modification
  const handleModification = () => {
    hasModifications.current = true
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Gestion générale du menu
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        controlPanelRef.current &&
        !controlPanelRef.current.contains(event.target)
      ) {
        setIsStrokeControlOpen(false)
        setIsAppearanceOpen(false)
        setIsShadowOpen(false)
      }

      // Gestion spécifique pour Shadow
      if (shadowPickerRef.current && !shadowPickerRef.current.contains(event.target)) {
        if (isShadowOpen) {
          // On vérifie si le menu était ouvert
          setIsShadowOpen(false)
          if (hasModifications.current) {
            setTimeout(() => {
              canvas?.fire('object:modified')
              canvas?.renderAll()
            }, 0)
            hasModifications.current = false // Reset le flag
          }
        }
      }
      // Gestion spécifique pour Stroke
      if (strokePickerRef.current && !strokePickerRef.current.contains(event.target)) {
        setIsStrokeControlOpen(false)
        if (hasModifications.current) {
          setTimeout(() => {
            canvas?.fire('object:modified')
            canvas?.renderAll()
          }, 0)
        }
      }

      // Gestion spécifique pour Appearance
      if (appearancePickerRef.current && !appearancePickerRef.current.contains(event.target)) {
        setIsAppearanceOpen(false)
        if (hasModifications.current) {
          setTimeout(() => {
            canvas?.fire('object:modified')
            canvas?.renderAll()
          }, 0)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [canvas, isShadowOpen])

  // Gestion du drag and drop
  const handleMouseDown = (e) => {
    if (e.target.closest(`.${styles.dragHandle}`)) {
      e.preventDefault()
      setIsDragging(true)
      const rect = menuRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && menuRef.current) {
      e.preventDefault()
      const parentRect = menuRef.current.parentElement.getBoundingClientRect()
      const menuRect = menuRef.current.getBoundingClientRect()

      let newX = e.clientX - parentRect.left - dragOffset.x
      let newY = e.clientY - parentRect.top - dragOffset.y

      newX = Math.max(10, Math.min(newX, parentRect.width - menuRect.width - 10))
      newY = Math.max(10, Math.min(newY, parentRect.height - menuRect.height - 10))

      setPosition({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  const handleGripClick = (e) => {
    e.stopPropagation()
    e.preventDefault()
  }

  const handleStrokeChangeWithFlag = (...args) => {
    handleStrokeChange(...args)
    handleModification()
    canvas?.renderAll()
  }
  const handleAppearanceChangeWithFlag = (props) => {
    if (!props) return
    const isQrCode = selectedObject?.isQRCode

    if (props.type === 'gradient') {
      if (isQrCode && props.colors?.length > 0) {
        onUpdateQrCode(selectedObject.qrText, props.colors[0])
        canvas?.getActiveObject()?.set('fill', props.colors[0])
        canvas?.renderAll()
        handleModification()
        return
      }

      if (props.gradientType === 'none') {
        removeGradient()
        canvas?.getActiveObject()?.set('fill', props.colors[0])
      } else {
        createGradient(props.gradientType, props.colors, props.direction, props.offsets)
      }
    } else if (props.type === 'opacity') {
      handleOpacityChange(props.opacity)
    }
    handleModification()
    canvas?.renderAll()
  }

  // Pour handleShadowChangeWithFlag, on simplifie :
  const handleShadowChangeWithFlag = (shadowProps) => {
    if (!shadowProps || typeof shadowProps !== 'object') return

    handleShadowChange(shadowProps) // Ceci met à jour l'objet visuel
    handleModification() // Marque qu'il y a eu une modification
    canvas?.renderAll() // Met à jour l'affichage

    // On ne lance PAS le fire('object:modified') ici
    // On le laisse se faire uniquement dans le handleClickOutside
  }
  return (
    <div
      ref={menuRef}
      className={styles.styleMenu}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'auto'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={styles.menuBar}>
        <div className={styles.dragHandle}>
          <IconButton
            onClick={handleGripClick}
            icon={faGripVertical}
            className="bg-transparent text-gray-400 hover:bg-gray-100"
            size="w-8 h-8"
            iconSize="text-sm"
          />
        </div>

        <div className={styles.menuItems}>
          <IconButton
            onClick={() => {
              setIsStrokeControlOpen(!isStrokeControlOpen)
              setIsAppearanceOpen(false)
              setIsShadowOpen(false)
              resetModificationFlag()
            }}
            icon={faCircleHalfStroke}
            className={`bg-transparent text-gray-600 hover:bg-gray-100 ${isStrokeControlOpen ? 'bg-gray-200' : ''}`}
            size="w-8 h-8"
            iconSize="text-sm"
            title="Contour"
          />

          <IconButton
            onClick={() => {
              setIsAppearanceOpen(!isAppearanceOpen)
              setIsStrokeControlOpen(false)
              setIsShadowOpen(false)
              resetModificationFlag()
            }}
            icon={faPalette}
            className={`bg-transparent text-gray-600 hover:bg-gray-100 ${isAppearanceOpen ? 'bg-gray-200' : ''}`}
            size="w-8 h-8"
            iconSize="text-sm"
            title="Apparence"
          />

          <IconButton
            onClick={() => {
              setIsShadowOpen(!isShadowOpen)
              setIsStrokeControlOpen(false)
              setIsAppearanceOpen(false)
              resetModificationFlag()
            }}
            icon={faSquare}
            className={`bg-transparent text-gray-600 hover:bg-gray-100 ${isShadowOpen ? 'bg-gray-200' : ''}`}
            size="w-8 h-8"
            iconSize="text-sm"
            title="Ombre"
          />
        </div>
      </div>

      {(isStrokeControlOpen || isAppearanceOpen || isShadowOpen) && (
        <div ref={controlPanelRef} className={styles.controlPanel}>
          {isStrokeControlOpen && (
            <StrokeControls
              isOpen={true}
              onToggle={() => setIsStrokeControlOpen(false)}
              onStrokeChange={handleStrokeChangeWithFlag}
              pickerRef={strokePickerRef}
            />
          )}

          {isAppearanceOpen && (
            <AppearanceControls
              isOpen={true}
              onToggle={() => setIsAppearanceOpen(false)}
              pickerRef={appearancePickerRef}
              onModification={handleAppearanceChangeWithFlag}
            />
          )}

          {isShadowOpen && (
            <ShadowControls
              isOpen={true}
              onToggle={() => setIsShadowOpen(false)}
              onModification={handleShadowChangeWithFlag}
              pickerRef={shadowPickerRef}
            />
          )}
        </div>
      )}
    </div>
  )
}
