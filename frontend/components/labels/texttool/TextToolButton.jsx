// frontend/components/labels/texttool/TextToolButton.jsx
import React from 'react'

const TextToolButton = ({
  textOptionsVisible,
  setTextOptionsVisible
}) => {
  return (
    <button
      className="toolButton"
      onClick={() =>
        setTextOptionsVisible(!textOptionsVisible)
      }
    >
      T
    </button>
  )
}

export default TextToolButton
