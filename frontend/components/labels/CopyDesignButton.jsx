import React from 'react'
import { useInstance } from '../../context/InstanceContext'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../ui/IconButton'

const CopyDesignButton = () => {
  const { copyDesign } = useInstance()

  return (
    <IconButton
      onClick={copyDesign}
      icon={faCopy}
      title="Copier le design"
      className="bg-blue-500 hover:bg-blue-600"
    />
  )
}

export default CopyDesignButton
