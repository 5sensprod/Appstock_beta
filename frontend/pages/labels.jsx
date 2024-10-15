import React from 'react'
import LabelDesigner from '../components/labels/LabelDesigner' // Import du composant LabelDesigner

const Labels = () => {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">
        Gestion des Labels
      </h1>
      <p className="mb-4">
        Ici, vous pouvez gérer vos labels.
      </p>

      {/* Intégration du composant LabelDesigner */}
      <LabelDesigner />
    </div>
  )
}

export default Labels
