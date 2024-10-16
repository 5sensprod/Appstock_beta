import React from 'react'

const TextToolButton = ({
  textOptionsVisible,
  setTextOptionsVisible,
  addTextElement
}) => {
  const handleClick = () => {
    setTextOptionsVisible(true)
    addTextElement() // Appel de la fonction d'ajout de texte
  }

  return (
    <button
      onClick={handleClick}
      className="rounded bg-blue-500 p-2 text-white"
    >
      Ajouter Texte
    </button>
  )
}

export default TextToolButton
