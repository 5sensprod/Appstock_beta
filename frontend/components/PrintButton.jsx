import React from 'react'

const PrintButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="rounded bg-blue-500 px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-blue-600 hover:shadow-lg"
    >
      Imprimer
    </button>
  )
}

export default PrintButton
