export const initialGridState = {
  config: {
    cellWidth: 48.5,
    cellHeight: 25,
    offsetTop: 22,
    offsetLeft: 8,
    spacingHorizontal: 0,
    spacingVertical: 0,
    pageWidth: 210, // A4 dimensions
    pageHeight: 297
  },
  grid: [], // Grille vide générée dynamiquement
  selectedCellId: null, // Aucun ID sélectionné au départ
  cellContents: {}, // Contient les données dynamiques des cellules
  clipboard: null, // Contenu temporaire pour le copier-coller
  currentPage: 0, // Page active
  totalPages: 1 // Nombre total de pages
}

export function gridReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_CONFIG': {
      const { pageWidth, pageHeight } = state.config
      const updatedConfig = { ...state.config, ...action.payload }

      // Validation des offsets
      if (updatedConfig.offsetTop >= pageHeight) {
        updatedConfig.offsetTop = pageHeight - 1
      }
      if (updatedConfig.offsetLeft >= pageWidth) {
        updatedConfig.offsetLeft = pageWidth - 1
      }
      // Validation des dimensions
      if (updatedConfig.cellWidth <= 0) {
        updatedConfig.cellWidth = 1
      }
      if (updatedConfig.cellHeight <= 0) {
        updatedConfig.cellHeight = 1
      }

      // Calcul du nombre de cellules seulement si les dimensions changent
      const dimensionsChanged =
        action.payload.cellWidth !== undefined ||
        action.payload.cellHeight !== undefined ||
        action.payload.spacingHorizontal !== undefined ||
        action.payload.spacingVertical !== undefined ||
        action.payload.pageWidth !== undefined ||
        action.payload.pageHeight !== undefined

      if (dimensionsChanged) {
        // Calculer le nombre de cellules par page avec la nouvelle configuration
        const availableWidth = pageWidth - 2 * updatedConfig.offsetLeft
        const availableHeight = pageHeight - 2 * updatedConfig.offsetTop
        const columns = Math.floor(
          (availableWidth + updatedConfig.spacingHorizontal) /
            (updatedConfig.cellWidth + updatedConfig.spacingHorizontal)
        )
        const rows = Math.floor(
          (availableHeight + updatedConfig.spacingVertical) /
            (updatedConfig.cellHeight + updatedConfig.spacingVertical)
        )
        const cellsPerPage = columns * rows

        return {
          ...state,
          config: updatedConfig,
          cellsPerPage
        }
      }

      return {
        ...state,
        config: updatedConfig
      }
    }

    case 'GENERATE_GRID': {
      const {
        cellWidth,
        cellHeight,
        offsetTop,
        offsetLeft,
        spacingHorizontal,
        spacingVertical,
        pageWidth,
        pageHeight
      } = state.config

      // Calcul du nombre de colonnes et lignes possibles
      const columns = Math.floor(
        (pageWidth - 2 * offsetLeft + spacingHorizontal) / (cellWidth + spacingHorizontal)
      )
      const rowsPerPage = Math.floor(
        (pageHeight - 2 * offsetTop + spacingVertical) / (cellHeight + spacingVertical)
      )

      const cellsPerPage = columns * rowsPerPage

      // Création de la grille
      const grid = []
      for (let pageIndex = 0; pageIndex < state.totalPages; pageIndex++) {
        for (let i = 0; i < cellsPerPage; i++) {
          const row = Math.floor(i / columns)
          const col = i % columns

          grid.push({
            id: `${pageIndex}-${row}-${col}`,
            pageIndex,
            row,
            col,
            width: (cellWidth / pageWidth) * 100,
            height: (cellHeight / pageHeight) * 100,
            left: ((offsetLeft + col * (cellWidth + spacingHorizontal)) / pageWidth) * 100,
            top: ((offsetTop + row * (cellHeight + spacingVertical)) / pageHeight) * 100
          })
        }
      }

      return {
        ...state,
        grid,
        cellsPerPage
      }
    }

    case 'IMPORT_CSV': {
      const rows = action.payload
      const newCellContents = { ...state.cellContents }

      // Calculer le nombre de pages nécessaires
      const requiredPages = Math.ceil(rows.length / state.cellsPerPage)
      const totalPages = Math.max(1, requiredPages)

      // Générer la grille avec le nouveau nombre de pages
      const updatedState = gridReducer({ ...state, totalPages }, { type: 'GENERATE_GRID' })

      // Associer les données CSV aux cellules
      rows.forEach((row, index) => {
        const pageIndex = Math.floor(index / state.cellsPerPage)
        const cellIndexInPage = index % state.cellsPerPage

        // Utiliser les dimensions actuelles pour calculer la position
        const columns = Math.floor(
          (state.config.pageWidth - 2 * state.config.offsetLeft + state.config.spacingHorizontal) /
            (state.config.cellWidth + state.config.spacingHorizontal)
        )

        const col = cellIndexInPage % columns
        const rowInPage = Math.floor(cellIndexInPage / columns)

        const cellId = `${pageIndex}-${rowInPage}-${col}`

        // Créer plusieurs objets IText pour chaque colonne de la ligne CSV
        const iTextObjects = Object.entries(row).map(([key, value], idx) => ({
          type: 'IText',
          text: value, // Utilise uniquement la valeur
          left: 10 + idx * 50, // Décalage horizontal (ajusté pour espacer les objets)
          top: 10, // Position verticale
          fontSize: 14, // Style par défaut
          fill: '#333' // Couleur par défaut
        }))

        newCellContents[cellId] = iTextObjects
      })

      return {
        ...updatedState,
        cellContents: newCellContents,
        totalPages
      }
    }

    case 'SELECT_FIRST_CELL': {
      if (state.grid.length > 0) {
        return {
          ...state,
          selectedCellId: state.grid[0].id // Sélectionne la première cellule par défaut
        }
      }
      return state
    }

    case 'SELECT_CELL':
      return {
        ...state,
        selectedCellId: action.payload // Met à jour l'ID de la cellule sélectionnée
      }
    case 'UPDATE_CELL_CONTENT': {
      const { id, content } = action.payload
      const newCellContents = { ...state.cellContents }

      if (!content || (content.type === 'IText' && content.text.trim() === '')) {
        // Supprime la cellule si le texte est vide
        delete newCellContents[id]
      } else {
        // Met à jour avec l'objet Fabric.js
        newCellContents[id] = content
      }

      return {
        ...state,
        cellContents: newCellContents
      }
    }

    case 'SET_PAGE': {
      const { page } = action.payload
      return {
        ...state,
        currentPage: Math.min(Math.max(0, page), state.totalPages - 1)
      }
    }
    case 'COPY_CELL': {
      const { cellId } = action.payload
      const copiedContent = state.cellContents[cellId]

      if (!copiedContent) {
        console.warn('No content to copy from the selected cell.')
        return state
      }

      console.log('COPY_CELL - Clipboard content:', copiedContent)

      return {
        ...state,
        clipboard: copiedContent // Stocke le contenu dans le clipboard
      }
    }

    case 'PASTE_CELL': {
      const { cellId } = action.payload
      const pastedContent = state.clipboard

      if (!pastedContent) {
        console.error('Clipboard is empty; nothing to paste.')
        return state
      }

      const updatedCellContents = {
        ...state.cellContents,
        [cellId]: pastedContent // Applique le contenu copié à la cellule sélectionnée
      }

      console.log('PASTE_CELL - Updated cellContents:', updatedCellContents)

      return {
        ...state,
        cellContents: updatedCellContents
      }
    }

    default:
      return state
  }
}
