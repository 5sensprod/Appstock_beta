import React from 'react'
import { GridProvider } from '../context/GridContext'
import LabelsContent from '../components/labelsgenerator/LabelsContent' // Chemin correct pour LabelsContent

const LabelsPage = () => {
  return (
    <GridProvider>
      <LabelsContent />
    </GridProvider>
  )
}

export default LabelsPage
