// frontend/components/labels/texttool/TextAlignmentButtons.jsx
import React from 'react'

const TextAlignmentButtons = ({
  setTextStyle
}) => {
  return (
    <div className="textTool flex gap-2">
      <button
        onClick={() =>
          setTextStyle((prev) => ({
            ...prev,
            textAlign: 'left'
          }))
        }
      >
        ⫷
      </button>
      <button
        onClick={() =>
          setTextStyle((prev) => ({
            ...prev,
            textAlign: 'center'
          }))
        }
      >
        ☰
      </button>
      <button
        onClick={() =>
          setTextStyle((prev) => ({
            ...prev,
            textAlign: 'right'
          }))
        }
      >
        ⫸
      </button>
    </div>
  )
}

export default TextAlignmentButtons
