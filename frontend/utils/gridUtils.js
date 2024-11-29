export const recalculatePages = (state) => {
  const { config, cellContents } = state
  const { cellsPerPage } = calculateGridDimensions(config)

  // Compter le nombre de cellules effectivement remplies
  const filledCells = Object.keys(cellContents).filter(
    (cellId) => cellContents[cellId] && cellContents[cellId].length > 0
  ).length

  // Calculer le nombre de pages nécessaires uniquement pour les cellules remplies
  const requiredPages = Math.max(state.totalPages, Math.ceil(filledCells / cellsPerPage))

  // Mettre à jour la grille uniquement si le nombre de pages change
  if (requiredPages !== state.totalPages) {
    const { grid: newGrid } = generateGrid(config, requiredPages)

    return {
      ...state,
      grid: newGrid,
      totalPages: requiredPages,
      currentPage: Math.min(state.currentPage, requiredPages - 1)
    }
  }

  return state
}

export const generateGrid = (config, totalPages) => {
  const {
    cellWidth,
    cellHeight,
    offsetTop,
    offsetLeft,
    spacingHorizontal,
    spacingVertical,
    pageWidth,
    pageHeight
  } = config

  const { columns, rows, cellsPerPage } = calculateGridDimensions(config)
  const grid = []
  let globalCellIndex = 0 // Compteur global pour l'ID unique des cellules

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const cellId = `${pageIndex}-${globalCellIndex}`

        grid.push({
          id: cellId,
          pageIndex,
          row,
          col,
          width: (cellWidth / pageWidth) * 100,
          height: (cellHeight / pageHeight) * 100,
          left: ((offsetLeft + col * (cellWidth + spacingHorizontal)) / pageWidth) * 100,
          top: ((offsetTop + row * (cellHeight + spacingVertical)) / pageHeight) * 100,
          globalIndex: globalCellIndex
        })

        globalCellIndex++
      }
    }
  }

  return { grid, cellsPerPage }
}
export const calculateGridDimensions = (config) => {
  const {
    pageWidth,
    pageHeight,
    offsetLeft,
    offsetTop,
    cellWidth,
    cellHeight,
    spacingHorizontal,
    spacingVertical
  } = config

  const availableWidth = pageWidth - 2 * offsetLeft
  const availableHeight = pageHeight - 2 * offsetTop

  const columns = Math.floor((availableWidth + spacingHorizontal) / (cellWidth + spacingHorizontal))
  const rows = Math.floor((availableHeight + spacingVertical) / (cellHeight + spacingVertical))

  const cellsPerPage = columns * rows

  return { columns, rows, cellsPerPage }
}

export const validateConfig = (config) => {
  const { pageWidth, pageHeight } = config
  const updatedConfig = { ...config }

  updatedConfig.offsetTop = Math.min(Math.max(updatedConfig.offsetTop, 0), pageHeight - 1)
  updatedConfig.offsetLeft = Math.min(Math.max(updatedConfig.offsetLeft, 0), pageWidth - 1)

  updatedConfig.cellWidth = Math.max(updatedConfig.cellWidth, 1)
  updatedConfig.cellHeight = Math.max(updatedConfig.cellHeight, 1)

  return updatedConfig
}

// Fonction pour importer des données CSV
export const importCsvData = (state, rows) => {
  const { config, cellContents } = state
  const { cellsPerPage } = calculateGridDimensions(config)

  // Créer une copie profonde des contenus de cellules existants
  const newCellContents = { ...cellContents }
  const newLinkedGroup = []

  // Compter le nombre total de cellules remplies
  const existingFilledCells = Object.keys(newCellContents).filter(
    (cellId) => newCellContents[cellId] && newCellContents[cellId].length > 0
  ).length

  // Calculer le nombre total de cellules après l'import
  const filledCells = existingFilledCells + rows.length

  // Calculer le nombre de pages nécessaires
  const requiredPages = Math.ceil(filledCells / cellsPerPage)
  const totalPages = Math.max(state.totalPages, requiredPages)

  // Générer une nouvelle grille avec le nombre de pages requis
  const { grid } = generateGrid(config, totalPages)

  // Associer les données du CSV aux cellules
  rows.forEach((row, index) => {
    // Utiliser l'index global pour placement
    const globalCellIndex = existingFilledCells + index
    const pageIndex = Math.floor(globalCellIndex / cellsPerPage)
    // const cellIndexInPage = globalCellIndex % cellsPerPage

    // const col = cellIndexInPage % columns
    // const rowInPage = Math.floor(cellIndexInPage / columns)

    const cellId = `${pageIndex}-${globalCellIndex}`

    // Générer le contenu de la cellule
    const cellContent = Object.entries(row).map(([key, value], idx) => {
      const type = key.includes('shape') ? 'rect' : 'i-text'
      const baseItem = {
        id: `${key}-${idx}`,
        linkedByCsv: true,
        left: 10 + idx * 50,
        top: 10
      }

      // Différencier le traitement des textes et des formes
      return type === 'i-text'
        ? {
            ...baseItem,
            type: 'i-text',
            text: value,
            fontSize: 14,
            fill: '#333'
          }
        : {
            ...baseItem,
            type: 'rect',
            width: 50,
            height: 30,
            fill: '#FFD700' // Jaune d'or pour les formes
          }
    })

    // Ajouter le contenu à la nouvelle carte des contenus
    newCellContents[cellId] = cellContent
    newLinkedGroup.push(cellId)
  })

  // Nettoyer les contenus des cellules pour correspondre à la nouvelle grille
  const cleanedCellContents = Object.fromEntries(
    Object.entries(newCellContents).filter(([key]) => grid.some((cell) => cell.id === key))
  )

  return {
    cellContents: cleanedCellContents,
    totalPages,
    grid,
    linkedGroups: [...state.linkedGroups, newLinkedGroup],
    cellsPerPage
  }
}

export const redistributeCellContents = (state) => {
  const { config, cellContents } = state
  const { cellsPerPage } = calculateGridDimensions(config)

  // Collecter toutes les cellules remplies, triées par leur contenu original
  const filledCells = Object.entries(cellContents)
    .filter(([_, content]) => content && content.length > 0)
    .sort((a, b) => {
      // Optionnel : ajouter un critère de tri si nécessaire
      const pageIndexA = parseInt(a[0].split('-')[0])
      const pageIndexB = parseInt(b[0].split('-')[0])
      return pageIndexA - pageIndexB
    })

  // Réinitialiser le contenu des cellules
  const newCellContents = {}
  const newLinkedGroups = []

  // Redistribuer les cellules remplies
  filledCells.forEach(([originalCellId, content], index) => {
    // Calculer la nouvelle page et la position sur cette page
    const newPageIndex = Math.floor(index / cellsPerPage)
    // const cellIndexInPage = index % cellsPerPage

    // Créer le nouvel ID de cellule basé sur la nouvelle configuration
    const newCellId = `${newPageIndex}-${index}`

    // Copier le contenu vers la nouvelle cellule
    newCellContents[newCellId] = content

    // Mettre à jour les groupes liés
    const linkedGroup = state.linkedGroups.find((group) => group.includes(originalCellId))
    if (linkedGroup) {
      const updatedGroup = linkedGroup.map((id) => (id === originalCellId ? newCellId : id))
      newLinkedGroups.push(updatedGroup)
    }
  })

  // Calculer le nombre de pages nécessaires
  const totalPages = Math.max(1, Math.ceil(filledCells.length / cellsPerPage))

  // Régénérer la grille avec le nouveau nombre de pages
  const { grid } = generateGrid(config, totalPages)

  return {
    ...state,
    cellContents: newCellContents,
    grid,
    totalPages,
    currentPage: Math.min(state.currentPage, totalPages - 1),
    linkedGroups: [
      ...state.linkedGroups.filter(
        (group) => !group.some((cellId) => filledCells.some(([id]) => id === cellId))
      ),
      ...newLinkedGroups
    ]
  }
}

export const withUndoRedo = (state, newState) => {
  return {
    ...newState,
    undoStack: [...state.undoStack, state],
    redoStack: []
  }
}
