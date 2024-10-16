// frontend/components/labels/texttool/ColorPicker.jsx
import React from 'react'

const ColorPicker = ({ color, setTextStyle }) => {
  return (
    <div className="textTool mb-2">
      <input
        type="color"
        value={color}
        onChange={(e) =>
          setTextStyle((prev) => ({
            ...prev,
            color: e.target.value
          }))
        }
      />
    </div>
  )
}

export default ColorPicker
