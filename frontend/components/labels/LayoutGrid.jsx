import React from 'react'
import useCellSelection from '../../hooks/useCellSelection'

const LayoutGrid = () => {
  useCellSelection() // Appel du hook sans extraire quoi que ce soit

  return (
    <div className="relative w-full border-2 border-gray-300 bg-light-background pb-[141.4%] shadow-xl dark:bg-dark-background">
      {/* Le conteneur où la grille sera injectée */}
      <div id="gridContainer" className="absolute left-0 top-0 size-full"></div>
    </div>
  )
}

export default LayoutGrid
