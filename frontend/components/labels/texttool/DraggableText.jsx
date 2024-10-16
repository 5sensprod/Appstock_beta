import React, {
  useRef,
  useEffect,
  useState
} from 'react'

const DraggableText = ({
  textStyle,
  textOptionsVisible,
  content,
  zoomLevel
}) => {
  const textElementRef = useRef(null)
  const [text, setText] = useState(
    content || 'Texte'
  )

  useEffect(() => {
    const textElement = textElementRef.current
    const parentElement =
      textElement.parentElement

    if (textElement && parentElement) {
      let isDragging = false
      let startX, startY

      const startDragging = (e) => {
        isDragging = true
        startX =
          e.clientX - textElement.offsetLeft
        startY = e.clientY - textElement.offsetTop
      }

      const drag = (e) => {
        if (isDragging) {
          const parentRect =
            parentElement.getBoundingClientRect()
          const textRect =
            textElement.getBoundingClientRect()

          // Calcul de la nouvelle position en fonction de la souris
          const newLeft = e.clientX - startX
          const newTop = e.clientY - startY

          // Ajuster les dimensions de parentRect et textRect en fonction du zoomLevel
          const scale = zoomLevel / 100

          const visibleParentWidth =
            parentRect.width / scale // Largeur visible du parent
          const visibleParentHeight =
            parentRect.height / scale // Hauteur visible du parent

          // Contraindre les positions pour permettre à l'élément de se déplacer jusqu'aux bords du canevas visible
          const constrainedLeft = Math.max(
            0,
            Math.min(
              newLeft,
              visibleParentWidth -
                textRect.width / scale
            )
          )
          const constrainedTop = Math.max(
            0,
            Math.min(
              newTop,
              visibleParentHeight -
                textRect.height / scale
            )
          )

          // Appliquer les nouvelles positions ajustées
          textElement.style.left = `${constrainedLeft}px`
          textElement.style.top = `${constrainedTop}px`
        }
      }

      const stopDragging = () => {
        isDragging = false
      }

      // Ajouter les écouteurs pour gérer le glisser-déposer
      textElement.addEventListener(
        'mousedown',
        startDragging
      )
      document.addEventListener('mousemove', drag)
      document.addEventListener(
        'mouseup',
        stopDragging
      )

      // Nettoyer les écouteurs
      return () => {
        textElement.removeEventListener(
          'mousedown',
          startDragging
        )
        document.removeEventListener(
          'mousemove',
          drag
        )
        document.removeEventListener(
          'mouseup',
          stopDragging
        )
      }
    }
  }, [zoomLevel])

  const handleInput = (e) => {
    setText(e.target.textContent)
  }

  return (
    <div
      ref={textElementRef}
      contentEditable="true"
      onInput={handleInput}
      className="absolute min-h-[20px] min-w-[50px] cursor-move border bg-white p-2"
      style={{
        ...textStyle,
        display: textOptionsVisible
          ? 'block'
          : 'none',
        position: 'absolute',
        fontSize: `${parseFloat(textStyle.fontSize) * (zoomLevel / 100)}px` // Faire évoluer la taille du texte avec le zoom
      }}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  )
}

export default DraggableText
