import React from 'react'

const TextInput = ({ value, onChange }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Entrez le message à imprimer"
      className="w-full rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-white shadow-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  )
}

export default TextInput
