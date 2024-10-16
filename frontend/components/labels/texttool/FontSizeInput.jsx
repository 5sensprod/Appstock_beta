// frontend/components/labels/texttool/FontSizeInput.jsx
import React from 'react'

const FontSizeInput = ({
  fontSize,
  setTextStyle
}) => {
  return (
    <div className="textTool mb-2">
      <input
        type="number"
        className="w-full"
        min="8"
        max="72"
        value={parseInt(fontSize)}
        onChange={(e) =>
          setTextStyle((prev) => ({
            ...prev,
            fontSize: `${e.target.value}px`
          }))
        }
      />
    </div>
  )
}

export default FontSizeInput
