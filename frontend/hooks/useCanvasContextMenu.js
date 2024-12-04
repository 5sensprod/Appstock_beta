// hooks/useCanvasContextMenu.js
import { useCallback, useEffect } from 'react'

const useCanvasContextMenu = (canvas) => {
  // Fonction utilitaire pour créer un élément de menu
  const createMenuItem = (label, action, menu, removeMenu) => {
    const option = document.createElement('div')
    option.innerText = label
    option.style.cssText = 'cursor: pointer; padding: 4px 8px;'

    option.addEventListener('click', () => {
      action()
      removeMenu()
    })

    option.addEventListener('mouseover', () => (option.style.backgroundColor = '#f0f0f0'))
    option.addEventListener('mouseout', () => (option.style.backgroundColor = 'transparent'))

    menu.appendChild(option)
  }

  // Fonctions de manipulation des objets
  const objectActions = (activeObject) => {
    const objects = canvas._objects
    const currentIndex = objects.indexOf(activeObject)

    return {
      bringToFront: () => {
        if (currentIndex < objects.length - 1) {
          objects.splice(currentIndex, 1)
          objects.push(activeObject)
          canvas.requestRenderAll()
        }
      },
      sendToBack: () => {
        if (currentIndex > 0) {
          objects.splice(currentIndex, 1)
          objects.unshift(activeObject)
          canvas.requestRenderAll()
        }
      },
      bringForward: () => {
        if (currentIndex < objects.length - 1) {
          objects.splice(currentIndex, 1)
          objects.splice(currentIndex + 1, 0, activeObject)
          canvas.requestRenderAll()
        }
      },
      sendBackward: () => {
        if (currentIndex > 0) {
          objects.splice(currentIndex, 1)
          objects.splice(currentIndex - 1, 0, activeObject)
          canvas.requestRenderAll()
        }
      }
    }
  }

  const handleContextMenu = useCallback(
    (event) => {
      if (!canvas?.getObjects) return
      event.preventDefault()

      // Nettoyer le menu existant
      const existingMenu = document.querySelector('.fabric-context-menu')
      existingMenu?.parentNode?.removeChild(existingMenu)

      // Obtenir l'objet actif
      const activeObject = canvas.findTarget(event)
      if (!activeObject) return

      // Créer le menu
      const contextMenu = document.createElement('div')
      contextMenu.className = 'fabric-context-menu'
      contextMenu.style.cssText = `
      position: fixed;
      left: ${event.clientX}px;
      top: ${event.clientY}px;
      background-color: white;
      border: 1px solid #ccc;
      padding: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      z-index: 1000;
    `

      const removeMenu = () => {
        contextMenu?.parentNode?.removeChild(contextMenu)
        document.removeEventListener('click', handleClickOutside)
      }

      const actions = objectActions(activeObject)
      const menuItems = [
        { label: 'Mettre au premier plan', action: actions.bringToFront },
        { label: "Mettre à l'arrière plan", action: actions.sendToBack },
        { label: "Avancer d'un niveau", action: actions.bringForward },
        { label: "Reculer d'un niveau", action: actions.sendBackward }
      ]

      menuItems.forEach(({ label, action }) =>
        createMenuItem(label, action, contextMenu, removeMenu)
      )

      document.body.appendChild(contextMenu)

      const handleClickOutside = (e) => {
        if (!contextMenu.contains(e.target)) removeMenu()
      }

      setTimeout(() => document.addEventListener('click', handleClickOutside), 0)
    },
    [canvas]
  )

  useEffect(() => {
    const canvasElement = canvas?.getElement()?.parentElement
    if (!canvasElement) return

    canvasElement.addEventListener('contextmenu', handleContextMenu)
    return () => {
      canvasElement.removeEventListener('contextmenu', handleContextMenu)
      document.querySelector('.fabric-context-menu')?.remove()
    }
  }, [canvas, handleContextMenu])
}

export default useCanvasContextMenu
