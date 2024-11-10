import React from 'react'
import useCellGrid from '../../hooks/useCellGrid'

const LayoutGrid = () => {
  useCellGrid() // Utiliser le hook pour générer et gérer la grille des cellules dynamiquement

  return (
    <div className="relative w-full border-2 border-gray-300 bg-light-background pb-[141.4%] shadow-xl dark:bg-dark-background">
      <div id="gridContainer" className="absolute left-0 top-0 size-full"></div>
    </div>
  )
}

export default LayoutGrid
