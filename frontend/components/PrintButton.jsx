// src/components/PrintButton.js
import React from 'react'

const PrintButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
    >
      Imprimer
    </button>
  )
}

export default PrintButton
