import React from 'react'
import { useInstance } from '../../context/InstanceContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/free-solid-svg-icons'

const CopyDesignButton = () => {
  const { copyDesign } = useInstance() // Fonction pour copier le design

  return (
    <button
      onClick={copyDesign}
      className="rounded bg-blue-500 p-2 text-white shadow hover:bg-blue-600"
      title="Copier le design"
    >
      <FontAwesomeIcon icon={faCopy} />
    </button>
  )
}

export default CopyDesignButton
