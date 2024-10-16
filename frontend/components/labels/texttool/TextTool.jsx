import React, { useState } from 'react'
import TextToolButton from './TextToolButton'
import TextOptionsPanel from './TextOptionsPanel'

const TextTool = ({
  addTextElement,
  textOptionsVisible,
  setTextOptionsVisible
}) => {
  // État pour gérer le style du texte
  const [textStyle, setTextStyle] = useState({
    fontFamily: 'Arial',
    fontSize: '16px',
    color: '#000000',
    textAlign: 'left'
  })

  // Fonction qui gère l'ajout d'un texte avec les styles actuels
  const handleAddTextElement = () => {
    addTextElement(textStyle) // Passer le style actuel lors de l'ajout du texte
  }

  return (
    <div>
      {/* Bouton pour ajouter un nouvel élément texte */}
      <TextToolButton
        textOptionsVisible={textOptionsVisible}
        setTextOptionsVisible={
          setTextOptionsVisible
        }
        addTextElement={handleAddTextElement}
      />

      {/* Panneau pour les options de style du texte */}
      {textOptionsVisible && (
        <TextOptionsPanel
          textStyle={textStyle}
          setTextStyle={setTextStyle} // Mise à jour du style à travers le panneau
        />
      )}
    </div>
  )
}

export default TextTool
