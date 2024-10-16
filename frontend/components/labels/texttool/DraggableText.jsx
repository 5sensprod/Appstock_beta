// frontend/components/labels/texttool/DraggableText.jsx
import React, {
  useRef,
  useEffect,
  useState
} from 'react'

const DraggableText = ({
  textStyle,
  textOptionsVisible
}) => {
  const textElementRef = useRef(null)
  const [text, setText] = useState('Texte')

  useEffect(() => {
    const textElement = textElementRef.current

    if (textElement) {
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
          textElement.style.left = `${e.clientX - startX}px`
          textElement.style.top = `${e.clientY - startY}px`
        }
      }

      const stopDragging = () => {
        isDragging = false
      }

      textElement.addEventListener(
        'mousedown',
        startDragging
      )
      document.addEventListener('mousemove', drag)
      document.addEventListener(
        'mouseup',
        stopDragging
      )

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
  }, [])

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
          : 'none'
      }}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  )
}

export default DraggableText
