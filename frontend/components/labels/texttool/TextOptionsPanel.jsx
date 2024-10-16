// frontend/components/labels/texttool/TextOptionsPanel.jsx
import React from 'react'
import FontSelector from './FontSelector'
import FontSizeInput from './FontSizeInput'
import ColorPicker from './ColorPicker'
import TextAlignmentButtons from './TextAlignmentButtons'

const TextOptionsPanel = ({
  textStyle,
  setTextStyle
}) => {
  return (
    <div className="absolute left-20 top-10 rounded-lg bg-gray-200 p-4 shadow-lg">
      <FontSelector
        fontFamily={textStyle.fontFamily}
        setTextStyle={setTextStyle}
      />
      <FontSizeInput
        fontSize={textStyle.fontSize}
        setTextStyle={setTextStyle}
      />
      <ColorPicker
        color={textStyle.color}
        setTextStyle={setTextStyle}
      />
      <TextAlignmentButtons
        setTextStyle={setTextStyle}
      />
    </div>
  )
}

export default TextOptionsPanel
