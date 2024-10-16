// frontend/components/labels/texttool/TextTool.jsx
import React, { useState } from 'react'
import TextToolButton from './TextToolButton'
import DraggableText from './DraggableText'
import TextOptionsPanel from './TextOptionsPanel'

const TextTool = () => {
  const [
    textOptionsVisible,
    setTextOptionsVisible
  ] = useState(false)
  const [textStyle, setTextStyle] = useState({
    fontFamily: 'Arial',
    fontSize: '16px',
    color: '#000000',
    textAlign: 'left'
  })

  return (
    <div>
      <TextToolButton
        textOptionsVisible={textOptionsVisible}
        setTextOptionsVisible={
          setTextOptionsVisible
        }
      />
      <DraggableText
        textStyle={textStyle}
        textOptionsVisible={textOptionsVisible}
      />
      {textOptionsVisible && (
        <TextOptionsPanel
          textStyle={textStyle}
          setTextStyle={setTextStyle}
        />
      )}
    </div>
  )
}

export default TextTool
