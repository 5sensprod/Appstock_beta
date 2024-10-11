// src/components/TextInput.js
import React from 'react'

const TextInput = ({ value, onChange }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Entrez le message à imprimer"
    />
  )
}

export default TextInput
