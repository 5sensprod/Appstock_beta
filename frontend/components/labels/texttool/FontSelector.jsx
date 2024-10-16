// frontend/components/labels/texttool/FontSelector.jsx
import React from 'react'

const FontSelector = ({
  fontFamily,
  setTextStyle
}) => {
  return (
    <div className="textTool mb-2">
      <select
        className="w-full"
        value={fontFamily}
        onChange={(e) =>
          setTextStyle((prev) => ({
            ...prev,
            fontFamily: e.target.value
          }))
        }
      >
        <option value="Arial">Arial</option>
        <option value="Helvetica">
          Helvetica
        </option>
        <option value="Times New Roman">
          Times New Roman
        </option>
        <option value="Courier New">
          Courier New
        </option>
      </select>
    </div>
  )
}

export default FontSelector
